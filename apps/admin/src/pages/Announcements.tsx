import { useState, useEffect } from 'react';
import { Table, Button, Tag, Modal, Form, Input, Select, DatePicker, Space, Popconfirm, message } from 'antd';
import { announcementApi } from '../api/admin';

export default function Announcements() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ visible: boolean; editId?: string }>({ visible: false });
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try { setData(await announcementApi.list()); } finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  const handleCreate = () => { form.resetFields(); setModal({ visible: true }); };
  const handleEdit = (r: any) => { form.setFieldsValue(r); setModal({ visible: true, editId: r.id }); };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: any = { ...values, startAt: values.timeRange?.[0]?.toISOString(), endAt: values.timeRange?.[1]?.toISOString() };
    delete payload.timeRange;
    if (modal.editId) { await announcementApi.update(modal.editId, payload); message.success('已更新'); }
    else { await announcementApi.create(payload); message.success('已创建'); }
    setModal({ visible: false }); loadData();
  };

  const columns = [
    { title: '标题', dataIndex: 'title' },
    { title: '类型', dataIndex: 'type', render: (v: string) => <Tag>{v}</Tag> },
    { title: '状态', dataIndex: 'isActive', render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? '已发布' : '未发布'}</Tag> },
    { title: '发布时间', dataIndex: 'publishedAt', render: (v: string) => v ? new Date(v).toLocaleString('zh-CN') : '-' },
    { title: '操作', render: (_: any, r: any) => (
      <Space>
        <Button size="small" onClick={() => handleEdit(r)}>编辑</Button>
        {r.isActive ? (
          <Popconfirm title="确认撤回？" onConfirm={async () => { await announcementApi.unpublish(r.id); message.success('已撤回'); loadData(); }}>
            <Button size="small">撤回</Button>
          </Popconfirm>
        ) : (
          <Popconfirm title="确认发布？" onConfirm={async () => { await announcementApi.publish(r.id); message.success('已发布'); loadData(); }}>
            <Button type="primary" size="small">发布</Button>
          </Popconfirm>
        )}
        <Popconfirm title="确认删除？" onConfirm={async () => { await announcementApi.remove(r.id); message.success('已删除'); loadData(); }}>
          <Button danger size="small">删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={handleCreate}>新建公告</Button>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
      <Modal title={modal.editId ? '编辑公告' : '新建公告'} open={modal.visible} onOk={handleSubmit} onCancel={() => setModal({ visible: false })} width={600}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
          <Form.Item name="type" label="类型" initialValue="popup">
            <Select options={[{ value: 'popup', label: '弹窗' }, { value: 'banner', label: '横幅' }, { value: 'update_tip', label: '更新提示' }]} />
          </Form.Item>
          <Form.Item name="timeRange" label="生效时间范围"><DatePicker.RangePicker showTime /></Form.Item>
          <Form.Item name="linkUrl" label="跳转链接"><Input placeholder="选填" /></Form.Item>
          <Form.Item name="minVersion" label="最低版本"><Input placeholder="选填，如 1.0.0" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
