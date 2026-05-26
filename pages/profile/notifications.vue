<template>
	<view class="page">
		<view class="tip">关闭提醒后，您仍可在订单页面查看服务进度。</view>
		<view class="card">
			<view v-for="item in items" :key="item.key" class="row">
				<view><text class="title">{{ item.title }}</text><text class="desc">{{ item.desc }}</text></view>
				<switch :checked="settings[item.key]" color="#237a4d" @change="change(item.key, $event)" />
			</view>
		</view>
		<view class="card">
			<view class="row last">
				<view><text class="title">夜间免打扰</text><text class="desc">22:00 - 07:00 仅保留重要订单提醒</text></view>
				<switch :checked="settings.quietHours" color="#237a4d" @change="change('quietHours', $event)" />
			</view>
		</view>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				settings: { order: true, system: true, promotion: true, quietHours: false },
				items: [
					{ key: 'order', title: '订单进度通知', desc: '接单、作业进度及完成状态提醒' },
					{ key: 'system', title: '系统通知', desc: '平台规则和账号安全相关消息' },
					{ key: 'promotion', title: '服务推荐', desc: '附近任务及植保服务信息' }
				]
			}
		},
		onLoad() { this.settings = { ...this.settings, ...(uni.getStorageSync('planeNotificationSettings') || {}) } },
		methods: {
			change(key, event) {
				this.settings[key] = event.detail.value
				uni.setStorageSync('planeNotificationSettings', this.settings)
				uni.showToast({ title: '设置已保存', icon: 'none' })
			}
		}
	}
</script>
<style scoped>
	.page { box-sizing: border-box; min-height: 100vh; padding: 28rpx; background: #f5f7f2; }
	.tip { margin-bottom: 22rpx; padding: 22rpx 25rpx; border-radius: 16rpx; color: #66776d; font-size: 24rpx; background: #eaf4eb; }
	.card { margin-bottom: 22rpx; padding: 0 26rpx; border-radius: 22rpx; background: #fff; }
	.row { display: flex; align-items: center; justify-content: space-between; min-height: 112rpx; border-bottom: 1rpx solid #edf1ea; }
	.row:last-child, .row.last { border-bottom: none; } .row view { display: flex; flex: 1; flex-direction: column; padding: 20rpx 22rpx 20rpx 0; }
	.title { color: #1d3026; font-size: 29rpx; } .desc { margin-top: 8rpx; color: #7b887f; font-size: 23rpx; }
</style>
