import { View, Text, ScrollView, Input } from '@tarojs/components';
import { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { fetchTags, createTag } from '../../services/tag';
import type { TagDto, TagType } from '@zuji/shared-types';
import './index.scss';

interface TagSelectorProps {
  // 标签类型
  type: TagType;
  // 已选中的标签 ID 列表
  selectedIds: string[];
  // 选中变化回调
  onChange: (ids: string[]) => void;
  // 是否允许创建新标签
  allowCreate?: boolean;
}

export default function TagSelector({
  type,
  selectedIds,
  onChange,
  allowCreate = true,
}: TagSelectorProps) {
  const [tags, setTags] = useState<TagDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [creating, setCreating] = useState(false);

  // 加载标签列表
  useEffect(() => {
    setLoading(true);
    fetchTags(type)
      .then(setTags)
      .catch((e) => {
        console.error('加载标签失败:', e);
        Taro.showToast({ title: '加载失败', icon: 'error' });
      })
      .finally(() => setLoading(false));
  }, [type]);

  // 切换选中状态
  const toggleTag = (tagId: string) => {
    if (selectedIds.includes(tagId)) {
      onChange(selectedIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedIds, tagId]);
    }
  };

  // 创建新标签
  const handleCreate = async () => {
    if (!newTagName.trim()) return;
    if (creating) return;
    setCreating(true);
    try {
      const newTag = await createTag({ name: newTagName.trim(), type });
      setTags([...tags, newTag]);
      onChange([...selectedIds, newTag.id]);
      setNewTagName('');
      setShowInput(false);
    } catch (e) {
      console.error('创建标签失败:', e);
      Taro.showToast({ title: '创建失败', icon: 'error' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <View className='tag-selector'>
      <ScrollView scrollX className='tag-selector__scroll'>
        {loading && <Text className='tag-selector__loading'>加载中...</Text>}
        {tags.map((tag) => (
          <View
            key={tag.id}
            className={`tag-selector__tag ${selectedIds.includes(tag.id) ? 'tag-selector__tag--active' : ''}`}
            onClick={() => toggleTag(tag.id)}
          >
            <Text>{tag.name}</Text>
            {tag.isSystem && <Text className='tag-selector__badge'>系统</Text>}
          </View>
        ))}
        {allowCreate && (
          <View
            className='tag-selector__tag tag-selector__tag--add'
            onClick={() => setShowInput(!showInput)}
          >
            <Text>+ 自定义</Text>
          </View>
        )}
      </ScrollView>
      {showInput && (
        <View className='tag-selector__input-bar'>
          <Input
            className='tag-selector__input'
            value={newTagName}
            onInput={(e) => setNewTagName(e.detail.value)}
            placeholder='输入标签名...'
            maxlength={20}
          />
          <View className='tag-selector__confirm' onClick={handleCreate}>
            <Text>确认</Text>
          </View>
        </View>
      )}
    </View>
  );
}
