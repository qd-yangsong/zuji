import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { UserOutlined, EnvironmentOutlined, CameraOutlined, FolderOutlined } from '@ant-design/icons';

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, places: 0, checkins: 0, collections: 0 });

  useEffect(() => {
    // 暂用占位数据，Plan 8 接入真实接口
    setStats({ users: 0, places: 0, checkins: 0, collections: 0 });
  }, []);

  return (
    <div>
      <h2>数据概览</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="用户数" value={stats.users} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="地点数" value={stats.places} prefix={<EnvironmentOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="打卡数" value={stats.checkins} prefix={<CameraOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="合集数" value={stats.collections} prefix={<FolderOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
