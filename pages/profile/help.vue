<template>
	<view class="page">
		<view class="hero">
			<text class="headline">需要帮助？</text>
			<text class="caption">客服将为您解答服务流程、订单及账号问题</text>
			<button open-type="contact" class="contact">联系在线客服</button>
		</view>
		<text class="heading">常见问题</text>
		<view class="card">
			<view v-for="(item, index) in faqs" :key="item.q" class="faq" @click="expanded = expanded === index ? -1 : index">
				<view class="question"><text>{{ item.q }}</text><text class="toggle">{{ expanded === index ? '-' : '+' }}</text></view>
				<text v-if="expanded === index" class="answer">{{ item.a }}</text>
			</view>
		</view>
		<text class="heading">意见反馈</text>
		<view class="feedback">
			<textarea v-model="feedback" maxlength="200" placeholder="请描述您的问题或建议" />
			<button class="submit" @click="submit">提交反馈</button>
		</view>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				expanded: -1, feedback: '',
				faqs: [
					{ q: '未登录可以浏览服务吗？', a: '可以，您可以先浏览公开服务，需要操作时再自行选择登录。' },
					{ q: '如何新增服务地址？', a: '登录后进入“我的 - 服务地址”，点击新增并保存地点信息。' },
					{ q: '如何关闭提醒？', a: '进入“消息通知”，分别调整需要接收的提醒开关。' }
				]
			}
		},
		methods: {
			submit() {
				if (!this.feedback.trim()) return uni.showToast({ title: '请填写反馈内容', icon: 'none' })
				const list = uni.getStorageSync('planeFeedbackList') || []
				list.unshift({ content: this.feedback.trim(), createdAt: Date.now() })
				uni.setStorageSync('planeFeedbackList', list); this.feedback = ''
				uni.showToast({ title: '反馈已记录', icon: 'success' })
			}
		}
	}
</script>
<style scoped>
	.page { box-sizing: border-box; min-height: 100vh; padding: 28rpx 28rpx 48rpx; background: #f5f7f2; }
	.hero { display: flex; flex-direction: column; padding: 34rpx 30rpx; border-radius: 24rpx; background: #237a4d; }
	.headline { color: #fff; font-size: 36rpx; font-weight: 600; } .caption { margin: 13rpx 0 27rpx; color: rgba(255,255,255,.76); font-size: 25rpx; }
	.contact { height: 78rpx; margin: 0; border-radius: 14rpx; color: #237a4d; font-size: 28rpx; background: #fff; }
	.heading { display: block; margin: 34rpx 4rpx 19rpx; color: #192920; font-size: 31rpx; font-weight: 600; }
	.card, .feedback { padding: 0 28rpx; border-radius: 22rpx; background: #fff; }
	.faq { padding: 27rpx 0; border-bottom: 1rpx solid #edf1ea; } .faq:last-child { border-bottom: none; }
	.question { display: flex; justify-content: space-between; color: #27382f; font-size: 27rpx; } .toggle { color: #237a4d; font-size: 34rpx; }
	.answer { display: block; margin-top: 18rpx; color: #758278; font-size: 24rpx; line-height: 40rpx; }
	.feedback { padding: 25rpx; } .feedback textarea { box-sizing: border-box; width: 100%; height: 180rpx; padding: 18rpx; border-radius: 13rpx; font-size: 27rpx; background: #f5f8f4; }
	.submit { width: 100%; height: 84rpx; margin-top: 18rpx; border-radius: 15rpx; color: #fff; font-size: 28rpx; background: #237a4d; }
	.contact::after, .submit::after { border: none; }
</style>
