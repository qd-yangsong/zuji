import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { UserOutlined, EnvironmentOutlined, CameraOutlined, FolderOutlined } from '@ant-design/icons';
import { statsApi } from '../api/admin';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await statsApi.overview();
      setStats(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <h2>数据概览</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="用户数" value={stats?.userCount ?? 0} prefix={<UserOutlined />} loading={loading} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="地点数" value={stats?.placeCount ?? 0} prefix={<EnvironmentOutlined />} loading={loading} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="打卡数" value={stats?.checkinCount ?? 0} prefix={<CameraOutlined />} loading={loading} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="合集数" value={stats?.collectionCount ?? 0} prefix={<FolderOutlined />} loading={loading} />
          </Card>
        </Col>
      </Row>

      <h3 style={{ marginTop: 24 }}>今日新增</h3>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="新增用户" value={stats?.todayNewUsers ?? 0} prefix={<UserOutlined />} loading={loading} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="新增地点" value={stats?.todayNewPlaces ?? 0} prefix={<EnvironmentOutlined />} loading={loading} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="新增打卡" value={stats?.todayNewCheckins ?? 0} prefix={<CameraOutlined />} loading={loading} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
