import { useState, useEffect } from 'react';
import { Table, Input, Space } from 'antd';
import { statsApi } from '../api/admin';

export default function Logs() {
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({ page: 1, pageSize: 20, action: '' });

  const loadData = async () => {
    setLoading(true);
    try { setData(await statsApi.logs(params)); } finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, [params]);

  const columns = [
    { title: '管理员ID', dataIndex: 'adminId' },
    { title: '操作类型', dataIndex: 'action' },
    { title: '目标', dataIndex: 'target', render: (v: string) => v || '-' },
    { title: '详情', dataIndex: 'detail', render: (v: string) => v?.slice(0, 100) || '-' },
    { title: 'IP', dataIndex: 'ip', render: (v: string) => v || '-' },
    { title: '时间', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString('zh-CN') },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search placeholder="操作类型" allowClear onSearch={v => setParams({ ...params, action: v, page: 1 })} style={{ width: 200 }} />
      </Space>
      <Table columns={columns} dataSource={data.items} rowKey="id" loading={loading}
        pagination={{ current: params.page, pageSize: params.pageSize, total: data.total, onChange: (p, ps) => setParams({ ...params, page: p, pageSize: ps }) }} />
    </div>
  );
}
