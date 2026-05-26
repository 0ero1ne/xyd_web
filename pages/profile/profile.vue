<template>
	<view class="page">
		<view class="user-card">
			<view class="avatar">
				<image v-if="isLoggedIn && userInfo.avatarUrl" class="avatar-image" :src="userInfo.avatarUrl" mode="aspectFill"></image>
				<text v-else>{{ isLoggedIn ? (role === 'farmer' ? '农' : '飞') : '访' }}</text>
			</view>
			<view class="user-info">
				<text class="name">{{ isLoggedIn ? (userInfo.nickname || roleName) : '游客用户' }}</text>
				<text class="verified">{{ statusText }}</text>
			</view>
		</view>

		<view v-if="isLoggedIn" class="settings">
			<view v-for="item in settings" :key="item" class="setting-row">
				<text>{{ item }}</text>
				<text class="arrow">›</text>
			</view>
		</view>

		<view v-else class="guest-tip">无需登录即可浏览平台服务，登录后可发布需求或承接任务。</view>

		<button class="logout" @click="handleAccountAction">
			{{ isLoggedIn ? '切换身份 / 退出登录' : '自愿登录并使用完整服务' }}
		</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isLoggedIn: false,
				role: 'farmer',
				userInfo: {
					avatarUrl: '',
					nickname: ''
				},
				settings: ['个人资料', '服务地址', '消息通知', '账号与安全', '帮助与客服']
			}
		},
		computed: {
			roleName() {
				return this.role === 'farmer' ? '农户用户' : '无人机飞手'
			},
			description() {
				return this.role === 'farmer' ? '需求发布方' : '专业服务方'
			},
			statusText() {
				return this.isLoggedIn ? `已登录 · ${this.roleName} · ${this.description}` : '可先浏览服务，按需选择登录'
			}
		},
		onShow() {
			this.isLoggedIn = Boolean(uni.getStorageSync('token'))
			this.role = uni.getStorageSync('planeUserRole') || 'farmer'
			this.userInfo = uni.getStorageSync('userInfo') || {
				avatarUrl: '',
				nickname: ''
			}
		},
		methods: {
			handleAccountAction() {
				if (this.isLoggedIn) {
					this.logout()
					return
				}
				uni.navigateTo({
					url: '/pages/index/index'
				})
			},
			logout() {
				uni.removeStorageSync('token')
				uni.removeStorageSync('userInfo')
				uni.removeStorageSync('planeUserRole')
				uni.removeStorageSync('planeUserRoleName')
				uni.removeStorageSync('planeWechatUser')
				this.isLoggedIn = false
				uni.switchTab({
					url: '/pages/menu/menu'
				})
			}
		}
	}
</script>

<style scoped>
	.page {
		box-sizing: border-box;
		min-height: 100vh;
		padding: 28rpx;
		background: #f5f7f2;
	}

	.user-card {
		display: flex;
		align-items: center;
		padding: 36rpx 30rpx;
		border-radius: 24rpx;
		background: #237a4d;
	}

	.avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 90rpx;
		height: 90rpx;
		margin-right: 24rpx;
		border-radius: 50%;
		color: #237a4d;
		font-size: 39rpx;
		font-weight: 600;
		background: #fff;
		overflow: hidden;
	}

	.avatar-image {
		width: 90rpx;
		height: 90rpx;
	}

	.user-info {
		display: flex;
		flex-direction: column;
	}

	.name {
		color: #fff;
		font-size: 35rpx;
		font-weight: 600;
	}

	.verified {
		margin-top: 10rpx;
		color: rgba(255, 255, 255, 0.74);
		font-size: 24rpx;
	}

	.settings {
		margin-top: 28rpx;
		padding: 0 28rpx;
		border-radius: 23rpx;
		background: #fff;
	}

	.guest-tip {
		margin-top: 28rpx;
		padding: 30rpx 28rpx;
		border-radius: 23rpx;
		color: #748278;
		font-size: 27rpx;
		line-height: 44rpx;
		background: #fff;
	}

	.setting-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 96rpx;
		border-bottom: 1rpx solid #edf1ea;
		color: #27382f;
		font-size: 28rpx;
	}

	.setting-row:last-child {
		border-bottom: 0;
	}

	.arrow {
		color: #a5aca5;
		font-size: 38rpx;
	}

	.logout {
		height: 90rpx;
		margin-top: 42rpx;
		border-radius: 18rpx;
		color: #237a4d;
		font-size: 28rpx;
		background: #fff;
	}

	.logout::after {
		border: none;
	}
</style>
