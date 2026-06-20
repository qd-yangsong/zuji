import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Tag, Space, Popconfirm } from 'antd';
import { PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import request from '../utils/request';

const { TextArea } = Input;

interface ThemeConfig {
  id: string;
  version: string;
  config: any;
  isActive: boolean;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function Themes() {
  const [data, setData] = useState<ThemeConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await request.get('/admin/themes');
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

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      let config;
      try {
        config = JSON.parse(values.configJson);
      } catch {
        message.error('配置 JSON 格式错误');
        return;
      }
      await request.post('/admin/themes', { version: values.version, config });
      message.success('创建成功');
      setModalOpen(false);
      form.resetFields();
      loadData();
    } catch (e: any) {
      if (e.response) message.error(e.response?.data?.message || '创建失败');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await request.post(`/admin/themes/${id}/publish`);
      message.success('发布成功，小程序将在下次启动时生效');
      loadData();
    } catch (e) {
      message.error('发布失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await request.delete(`/admin/themes/${id}`);
      message.success('删除成功');
      loadData();
    } catch (e: any) {
      message.error(e.response?.data?.message || '删除失败');
    }
  };

  const columns = [
    { title: '版本号', dataIndex: 'version', render: (v: string, r: ThemeConfig) => <Space>{v}{r.isActive && <Tag color="green">生效中</Tag>}</Space> },
    { title: '主题数', dataIndex: 'config', render: (c: any) => Array.isArray(c) ? c.length : 0 },
    { title: '更新时间', dataIndex: 'updatedAt', render: (t: string) => new Date(t).toLocaleString('zh-CN') },
    {
      title: '操作',
      render: (_: any, record: ThemeConfig) => (
        <Space>
          {!record.isActive && (
            <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => handlePublish(record.id)}>发布</Button>
          )}
          {!record.isActive && (
            <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
              <Button size="small" danger>删除</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // 默认配置模板
  const defaultConfig = JSON.stringify([
    { id: 'night', emoji: '🌙', bg: '#3B4B7A', iconBg: '#FFFFFF', iconColor: '#3B4B7A', illustUrl: '', decoUrl: '' },
    { id: 'morning', emoji: '🌅', bg: '#FF8C42', iconBg: '#FFFFFF', iconColor: '#FF8C42', illustUrl: '', decoUrl: '' },
  ], null, 2);

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>主题配置</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>新建版本</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />

      <Modal title="新建主题版本" open={modalOpen} onOk={handleCreate} onCancel={() => { setModalOpen(false); form.resetFields(); }} width={700}>
        <Form form={form} layout="vertical" initialValues={{ configJson: defaultConfig }}>
          <Form.Item name="version" label="版本号" rules={[{ required: true }]} extra="如 1.0.1">
            <Input placeholder="1.0.1" />
          </Form.Item>
          <Form.Item name="configJson" label="主题配置 JSON" rules={[{ required: true }]} extra="ThemeResource 数组">
            <TextArea rows={15} style={{ fontFamily: 'monospace' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
