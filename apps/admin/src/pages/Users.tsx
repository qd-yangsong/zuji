import { useState, useEffect } from 'react';
import { Table, Avatar, Tag, Button, Space, Input, Modal, message } from 'antd';
import { userApi } from '../api/admin';

export default function Users() {
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({ page: 1, pageSize: 20, keyword: '', status: '' });
  const [banModal, setBanModal] = useState({ visible: false, id: '', reason: '' });

  const loadData = async () => {
    setLoading(true);
    try { setData(await userApi.list(params)); } finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, [params]);

  const handleBan = async () => {
    await userApi.ban(banModal.id, banModal.reason);
    message.success('已封禁'); setBanModal({ visible: false, id: '', reason: '' }); loadData();
  };

  const handleUnban = async (id: string) => {
    await userApi.unban(id); message.success('已解封'); loadData();
  };

  const columns = [
    { title: '头像', dataIndex: 'avatarUrl', render: (v: string) => v ? <Avatar src={v} /> : <Avatar>U</Avatar> },
    { title: '昵称', dataIndex: 'nickname', render: (v: string) => v || '未设置' },
    { title: '角色', dataIndex: 'role', render: (v: string) => <Tag color={v === 'admin' ? 'red' : 'blue'}>{v === 'admin' ? '管理员' : '用户'}</Tag> },
    { title: '状态', dataIndex: 'status', render: (v: string) => <Tag color={v === 'active' ? 'green' : 'red'}>{v === 'active' ? '正常' : '已封禁'}</Tag> },
    { title: '地点数', dataIndex: 'placeCount' },
    { title: '打卡数', dataIndex: 'checkinCount' },
    { title: '注册时间', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString('zh-CN') },
    { title: '操作', render: (_: any, r: any) => r.role === 'admin' ? '-' : r.status === 'active' ? (
      <Button danger size="small" onClick={() => setBanModal({ visible: true, id: r.id, reason: '' })}>封禁</Button>
    ) : (
      <Button size="small" onClick={() => handleUnban(r.id)}>解封</Button>
    )},
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search placeholder="搜索昵称" allowClear onSearch={v => setParams({ ...params, keyword: v, page: 1 })} style={{ width: 200 }} />
        <Input.Search placeholder="状态" allowClear onSearch={v => setParams({ ...params, status: v, page: 1 })} style={{ width: 100 }} />
      </Space>
      <Table columns={columns} dataSource={data.items} rowKey="id" loading={loading}
        pagination={{ current: params.page, pageSize: params.pageSize, total: data.total, onChange: (p, ps) => setParams({ ...params, page: p, pageSize: ps }) }} />
      <Modal title="封禁用户" open={banModal.visible} onOk={handleBan} onCancel={() => setBanModal({ visible: false, id: '', reason: '' })}>
        <Input.TextArea value={banModal.reason} onChange={e => setBanModal({ ...banModal, reason: e.target.value })} rows={3} placeholder="封禁原因" />
      </Modal>
    </div>
  );
}
