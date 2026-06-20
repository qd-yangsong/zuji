import { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Input, Select, message } from 'antd';
import { feedbackApi } from '../api/admin';

export default function Feedbacks() {
  const [data, setData] = useState({ items: [], total: 0 });
  const [stats, setStats] = useState({ pending: 0, processing: 0, resolved: 0, closed: 0, byType: [] as any[] });
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({ page: 1, pageSize: 20, status: '', type: '' });
  const [detailModal, setDetailModal] = useState({ visible: false, data: null as any });
  const [replyModal, setReplyModal] = useState({ visible: false, id: '', reply: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([feedbackApi.list(params), feedbackApi.stats()]);
      setData(listRes); setStats(statsRes);
    } finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, [params]);

  const handleReply = async () => {
    await feedbackApi.reply(replyModal.id, replyModal.reply);
    message.success('已回复'); setReplyModal({ visible: false, id: '', reply: '' }); loadData();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await feedbackApi.updateStatus(id, status); message.success('状态已更新'); loadData();
  };

  const typeMap: any = { bug: ['red', 'Bug'], suggestion: ['blue', '建议'], complaint: ['orange', '投诉'], other: ['default', '其他'] };
  const statusMap: any = { pending: ['orange', '待处理'], processing: ['blue', '处理中'], resolved: ['green', '已解决'], closed: ['default', '已关闭'] };

  const columns = [
    { title: '类型', dataIndex: 'type', render: (v: string) => { const [c, t] = typeMap[v] || ['default', v]; return <Tag color={c}>{t}</Tag>; } },
    { title: '内容摘要', dataIndex: 'content', render: (v: string) => v?.slice(0, 40) },
    { title: '联系方式', dataIndex: 'contact', render: (v: string) => v || '-' },
    { title: '状态', dataIndex: 'status', render: (v: string) => { const [c, t] = statusMap[v] || ['default', v]; return <Tag color={c}>{t}</Tag>; } },
    { title: '创建时间', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString('zh-CN') },
    { title: '操作', render: (_: any, r: any) => (
      <Space>
        <Button size="small" onClick={() => setDetailModal({ visible: true, data: r })}>详情</Button>
        <Button size="small" onClick={() => setReplyModal({ visible: true, id: r.id, reply: r.reply || '' })}>回复</Button>
        <Select size="small" value={r.status} onChange={(v) => handleStatusChange(r.id, v)} style={{ width: 100 }}
          options={[{ value: 'pending', label: '待处理' }, { value: 'processing', label: '处理中' }, { value: 'resolved', label: '已解决' }, { value: 'closed', label: '已关闭' }]} />
      </Space>
    )},
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Card size="small"><p>待处理</p><h2>{stats.pending}</h2></Card>
        <Card size="small"><p>处理中</p><h2>{stats.processing}</h2></Card>
        <Card size="small"><p>已解决</p><h2>{stats.resolved}</h2></Card>
        <Card size="small"><p>已关闭</p><h2>{stats.closed}</h2></Card>
      </Space>
      <Space style={{ marginBottom: 16 }}>
        <Select value={params.status || ''} onChange={v => setParams({ ...params, status: v, page: 1 })} style={{ width: 120 }} allowClear placeholder="状态"
          options={[{ value: 'pending', label: '待处理' }, { value: 'processing', label: '处理中' }, { value: 'resolved', label: '已解决' }, { value: 'closed', label: '已关闭' }]} />
        <Select value={params.type || ''} onChange={v => setParams({ ...params, type: v, page: 1 })} style={{ width: 120 }} allowClear placeholder="类型"
          options={[{ value: 'bug', label: 'Bug' }, { value: 'suggestion', label: '建议' }, { value: 'complaint', label: '投诉' }, { value: 'other', label: '其他' }]} />
      </Space>
      <Table columns={columns} dataSource={data.items} rowKey="id" loading={loading}
        pagination={{ current: params.page, pageSize: params.pageSize, total: data.total, onChange: (p, ps) => setParams({ ...params, page: p, pageSize: ps }) }} />
      <Modal title="反馈详情" open={detailModal.visible} onCancel={() => setDetailModal({ visible: false, data: null })} footer={null} width={600}>
        {detailModal.data && (
          <div>
            <p><strong>类型：</strong>{typeMap[detailModal.data.type]?.[1]}</p>
            <p><strong>内容：</strong>{detailModal.data.content}</p>
            <p><strong>联系方式：</strong>{detailModal.data.contact || '无'}</p>
            <p><strong>设备：</strong>{detailModal.data.platform || '未知'}</p>
            <p><strong>管理员回复：</strong>{detailModal.data.reply || '暂无'}</p>
          </div>
        )}
      </Modal>
      <Modal title="回复反馈" open={replyModal.visible} onOk={handleReply} onCancel={() => setReplyModal({ visible: false, id: '', reply: '' })}>
        <Input.TextArea value={replyModal.reply} onChange={e => setReplyModal({ ...replyModal, reply: e.target.value })} rows={4} placeholder="请输入回复内容" />
      </Modal>
    </div>
  );
}
