import { View, Text, ScrollView } from '@tarojs/components';
import './index.scss';

// 隐私政策正文，按章节组织，便于后续维护
const SECTIONS = [
  {
    title: '一、我们收集的信息',
    content:
      '为提供完整服务，我们可能会收集你在授权登录时提供的微信公开信息（如昵称、头像、openid），以及你在使用本小程序过程中主动填写的地点、照片、打卡记录、合集等内容信息。',
  },
  {
    title: '二、信息使用目的',
    content:
      '我们使用上述信息来识别你的身份、为你生成专属的内容记录、优化服务体验，并在必要时与你取得联系。我们不会将你的个人信息用于未经授权的用途。',
  },
  {
    title: '三、信息存储与保护',
    content:
      '我们会采取符合业界标准的安全措施存储和保护你的信息，防止数据丢失、被滥用或未经授权的访问。你在本小程序中上传的内容将存储在境内服务器，除非法律法规另有要求，我们不会跨境传输你的个人信息。',
  },
  {
    title: '四、信息共享',
    content:
      '我们不会向第三方出售你的个人信息。仅在法律法规要求、获得你的明确授权，或为保护本小程序及其他用户合法权益所必需时，我们才可能在必要范围内共享信息。',
  },
  {
    title: '五、你的权利',
    content:
      '你可以随时查看、修改或删除你在本小程序中发布的内容。如需注销账号或删除个人信息，可通过反馈入口联系我们处理。',
  },
  {
    title: '六、未成年人保护',
    content:
      '本小程序主要面向成年人使用。若你是未成年人，请在监护人指导下使用，并在监护人同意后提供个人信息。',
  },
  {
    title: '七、政策更新',
    content:
      '我们可能会根据产品变化或法律要求修订本隐私政策。修订后的政策将在本小程序内公示，继续使用服务即视为接受修订后的政策。',
  },
  {
    title: '八、联系方式',
    content:
      '如你对本隐私政策或个人信息处理有任何疑问、意见或投诉，可通过「我的」→「反馈」入口提交，我们将在收到后尽快回复处理。',
  },
];

export default function Privacy() {
  return (
    <ScrollView className='privacy' scrollY>
      <View className='privacy__card'>
        <Text className='privacy__title'>隐私政策</Text>
        <Text className='privacy__date'>生效日期：2026 年 7 月 15 日</Text>
        {SECTIONS.map((section) => (
          <View key={section.title} className='privacy__section'>
            <Text className='privacy__section-title'>{section.title}</Text>
            <Text className='privacy__section-text'>{section.content}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
