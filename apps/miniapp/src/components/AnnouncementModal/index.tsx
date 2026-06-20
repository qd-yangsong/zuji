import { View, Text, ScrollView } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { fetchActiveAnnouncements } from '../../services/announcement';
import './index.scss';

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  linkUrl?: string;
}

const READ_KEY = 'read_announcement_ids';

export default function AnnouncementModal({ visible, onClose }: Props) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;
    // 拉取公告
    fetchActiveAnnouncements()
      .then((data: Announcement[]) => {
        // 过滤已读
        const readIds = Taro.getStorageSync(READ_KEY) || [];
        const unread = data.filter((a) => !readIds.includes(a.id));
        setAnnouncements(unread);
        setCurrentIndex(0);
      })
      .catch(() => {});
  }, [visible]);

  const handleClose = () => {
    if (announcements.length > 0) {
      const current = announcements[currentIndex];
      const readIds = Taro.getStorageSync(READ_KEY) || [];
      if (!readIds.includes(current.id)) {
        Taro.setStorageSync(READ_KEY, [...readIds, current.id]);
      }
    }
    // 如果还有下一条，展示下一条
    if (currentIndex < announcements.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  if (!visible || announcements.length === 0) return null;
  const current = announcements[currentIndex];

  return (
    <View className='announcement-overlay' onClick={handleClose}>
      <View className='announcement-modal' onClick={(e) => e.stopPropagation()}>
        <View className='announcement-modal__header'>
          <Text className='announcement-modal__title'>{current.title}</Text>
        </View>
        <ScrollView className='announcement-modal__body' scrollY>
          <Text className='announcement-modal__content'>{current.content}</Text>
        </ScrollView>
        <View className='announcement-modal__footer'>
          {current.linkUrl && (
            <View
              className='announcement-modal__link'
              onClick={() => {
                Taro.setClipboardData({ data: current.linkUrl! });
                Taro.showToast({ title: '链接已复制', icon: 'success' });
              }}
            >
              <Text>了解更多</Text>
            </View>
          )}
          <View className='announcement-modal__btn' onClick={handleClose}>
            <Text>{currentIndex < announcements.length - 1 ? '下一条' : '我知道了'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
