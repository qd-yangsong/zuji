import { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Input, Select, message } from 'antd';
import { reviewApi } from '../api/admin';

export default function Reviews() {
  const [data, setData] = useState({ items: [], total: 0 });
  const [stats, setStats] = useState({ place: { pending: 0, rejected: 0, passed: 0 }, checkin: { pending: 0, rejected: 0, passed: 0 }, totalPending: 0 });
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({ page: 1, pageSize: 20, type: '', status: 'pending' });
  const [rejectModal, setRejectModal] = useState<{ visible: boolean; contentType?: string; id?: string; reason: string }>({ visible: false, reason: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        reviewApi.list(params),
        reviewApi.stats(),
      ]);
      setData(listRes);
      setStats(statsRes);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [params]);

  const handlePass = async (contentType: string, id: string) => {
    await reviewApi.review(contentType, id, { action: 'passed' });
    message.success('已通过');
    loadData();
  };

  const handleReject = async () => {
    const { contentType, id, reason } = rejectModal;
    if (!contentType || !id) return;
    await reviewApi.review(contentType, id, { action: 'rejected', reason });
    message.success('已拒绝');
    setRejectModal({ visible: false, reason: '' });
    loadData();
  };

  const columns = [
    { title: '类型', dataIndex: 'contentType', render: (v: string) => <Tag color={v === 'place' ? 'blue' : 'green'}>{v === 'place' ? '地点' : '打卡'}</Tag> },
    { title: '摘要', render: (_: any, r: any) => r.customName || r.content?.slice(0, 50) || r.id },
    { title: '创建时间', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString('zh-CN') },
    { title: '状态', dataIndex: 'reviewStatus', render: (v: string) => {
      const map: any = { pending: ['orange', '待审核'], passed: ['green', '已通过'], rejected: ['red', '已拒绝'] };
      const [color, text] = map[v] || ['default', v];
      return <Tag color={color}>{text}</Tag>;
    }},
    { title: '操作', render: (_: any, r: any) => r.reviewStatus === 'pending' ? (
      <Space>
        <Button type="primary" size="small" onClick={() => handlePass(r.contentType, r.id)}>通过</Button>
        <Button danger size="small" onClick={() => setRejectModal({ visible: true, contentType: r.contentType, id: r.id, reason: '' })}>拒绝</Button>
      </Space>
    ) : '-' },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Card size="small"><p>待审核</p><h2>{stats.totalPending}</h2></Card>
        <Card size="small"><p>地点已通过</p><h2>{stats.place.passed}</h2></Card>
        <Card size="small"><p>打卡已通过</p><h2>{stats.checkin.passed}</h2></Card>
      </Space>
      <Space style={{ marginBottom: 16 }}>
        <Select value={params.type || ''} onChange={v => setParams({ ...params, type: v, page: 1 })} style={{ width: 120 }}
          options={[{ value: '', label: '全部类型' }, { value: 'place', label: '地点' }, { value: 'checkin', label: '打卡' }]} />
        <Select value={params.status} onChange={v => setParams({ ...params, status: v, page: 1 })} style={{ width: 120 }}
          options={[{ value: 'pending', label: '待审核' }, { value: 'passed', label: '已通过' }, { value: 'rejected', label: '已拒绝' }]} />
      </Space>
      <Table columns={columns} dataSource={data.items} rowKey="id" loading={loading}
        pagination={{ current: params.page, pageSize: params.pageSize, total: data.total, onChange: (p, ps) => setParams({ ...params, page: p, pageSize: ps }) }} />
      <Modal title="拒绝原因" open={rejectModal.visible} onOk={handleReject} onCancel={() => setRejectModal({ visible: false, reason: '' })}>
        <Input.TextArea value={rejectModal.reason} onChange={e => setRejectModal({ ...rejectModal, reason: e.target.value })} placeholder="请输入拒绝原因" rows={3} />
      </Modal>
    </div>
  );
}
