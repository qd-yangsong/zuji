import { View, Text, ScrollView } from '@tarojs/components';
import './index.scss';

// 用户协议正文，按章节组织，便于后续维护
const SECTIONS = [
  {
    title: '一、服务说明',
    content:
      '足迹手帐（以下简称“本小程序”）为你提供地点收藏、打卡记录、旅程合集等个人化内容管理服务。你使用本小程序服务时，应遵守本协议及相关法律法规。',
  },
  {
    title: '二、账号与登录',
    content:
      '本小程序采用微信授权登录方式。你授权微信提供必要的身份信息后，即可使用相关服务。你应妥善保管自己的微信账号及设备，因保管不善导致的损失由你自行承担。',
  },
  {
    title: '三、用户行为规范',
    content:
      '你承诺在使用本小程序过程中，不发布、传播违法、违规或侵犯他人合法权益的内容（包括但不限于图片、文字、地点信息）。如你发现他人存在违规行为，可通过反馈入口向我们举报。',
  },
  {
    title: '四、知识产权',
    content:
      '本小程序的界面设计、功能逻辑、品牌标识及相关代码等知识产权归开发者所有。你在本小程序中上传的地点、照片、打卡记录等内容，知识产权归你所有，但你授予我们为提供服务而必要的存储、展示与处理权限。',
  },
  {
    title: '五、免责声明',
    content:
      '本小程序按现有技术和条件提供服务，我们会尽力维护服务的稳定性与安全性，但不对不可抗力、第三方原因或维护升级导致的服务中断承担责任。',
  },
  {
    title: '六、协议变更',
    content:
      '我们可能会根据业务需要不时修订本协议。修订后的协议将在本小程序内公示，继续使用服务即视为接受修订后的协议。',
  },
];

export default function Agreement() {
  return (
    <ScrollView className='agreement' scrollY>
      <View className='agreement__card'>
        <Text className='agreement__title'>用户协议</Text>
        <Text className='agreement__date'>生效日期：2026 年 7 月 15 日</Text>
        {SECTIONS.map((section) => (
          <View key={section.title} className='agreement__section'>
            <Text className='agreement__section-title'>{section.title}</Text>
            <Text className='agreement__section-text'>{section.content}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
