import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, Image } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import request from '../utils/request';

const CATEGORIES = [
  { value: 'theme_illust', label: '主题插画' },
  { value: 'theme_deco', label: '主题装饰' },
  { value: 'empty_state', label: '空状态插画' },
  { value: 'tag_icon', label: '标签图标' },
  { value: 'logo', label: '品牌 Logo' },
];

interface Asset {
  id: string;
  category: string;
  key: string;
  name: string;
  url: string;
  mimeType: string;
  fileSize: number;
  status: string;
  createdAt: string;
}

export default function Assets() {
  const [data, setData] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [uploadUrl, setUploadUrl] = useState('');

  const loadData = async (category?: string) => {
    setLoading(true);
    try {
      const res: any = await request.get('/admin/assets', { params: { category } });
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      await request.post('/admin/assets', {
        ...values,
        url: uploadUrl,
        mimeType: 'image/png',
        fileSize: 0,
      });
      message.success('创建成功');
      setModalOpen(false);
      form.resetFields();
      setUploadUrl('');
      loadData();
    } catch (e: any) {
      if (e.response) message.error(e.response?.data?.message || '创建失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await request.delete(`/admin/assets/${id}`);
      message.success('删除成功');
      loadData();
    } catch (e) {
      message.error('删除失败');
    }
  };

  const handleToggleStatus = async (record: Asset) => {
    try {
      await request.patch(`/admin/assets/${record.id}`, {
        status: record.status === 'active' ? 'inactive' : 'active',
      });
      message.success('更新成功');
      loadData();
    } catch (e) {
      message.error('更新失败');
    }
  };

  const columns = [
    { title: '预览', dataIndex: 'url', render: (url: string) => <Image width={60} src={url} /> },
    { title: '名称', dataIndex: 'name' },
    { title: '分类', dataIndex: 'category', render: (c: string) => CATEGORIES.find((cat) => cat.value === c)?.label || c },
    { title: '标识', dataIndex: 'key' },
    { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? '启用' : '停用'}</Tag> },
    {
      title: '操作',
      render: (_: any, record: Asset) => (
        <Space>
          <Button size="small" onClick={() => handleToggleStatus(record)}>{record.status === 'active' ? '停用' : '启用'}</Button>
          <Button size="small" danger onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>素材管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>新增素材</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />

      <Modal title="新增素材" open={modalOpen} onOk={handleAdd} onCancel={() => { setModalOpen(false); form.resetFields(); setUploadUrl(''); }}>
        <Form form={form} layout="vertical">
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Select options={CATEGORIES} />
          </Form.Item>
          <Form.Item name="key" label="资源标识" rules={[{ required: true }]} extra="如 night.illustUrl">
            <Input placeholder="night.illustUrl" />
          </Form.Item>
          <Form.Item name="name" label="资源名称" rules={[{ required: true }]}>
            <Input placeholder="夜晚主题插画" />
          </Form.Item>
          <Form.Item label="资源 URL" required>
            <Input
              placeholder="粘贴 COS 上传后的 URL"
              value={uploadUrl}
              onChange={(e) => setUploadUrl(e.target.value)}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              请先通过 COS 控制台或工具上传图片，然后粘贴 URL
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
