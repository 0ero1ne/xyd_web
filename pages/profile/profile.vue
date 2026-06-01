<template>
	<view class="page">
		<view class="user-card">
			<view class="avatar">
				<image v-if="isLoggedIn && userInfo.avatarUrl" class="avatar-image" :src="userInfo.avatarUrl" mode="aspectFill"></image>
				<text v-else>{{ isLoggedIn ? '飞' : '入' }}</text>
			</view>
			<view class="user-info">
				<text class="name">{{ isLoggedIn ? (userInfo.nickname || roleName) : '飞手未登录' }}</text>
				<text class="verified">{{ statusText }}</text>
			</view>
		</view>

		<view class="income-card">
			<text class="income-title">累计收入</text>
			<text class="income-amount">¥{{ formatIncomeValue(incomeSummary.totalIncome) }}</text>
			<text class="income-desc">已完成订单 {{ incomeSummary.completedOrderCount || 0 }} 单</text>
		</view>

		<view class="settings">
			<view v-for="item in settings" :key="item.url" class="setting-row" @click="openSetting(item)">
				<view class="setting-content">
					<text>{{ item.title }}</text>
					<text class="setting-desc">{{ item.description }}</text>
				</view>
				<text class="arrow">›</text>
			</view>
		</view>

		<view v-if="!isLoggedIn" class="guest-tip">登录后可完善飞手资料、维护常驻服务区域并管理账号安全。</view>

		<button class="logout" @click="handleAccountAction">
			{{ isLoggedIn ? '退出当前飞手账号' : '登录并入住飞手端' }}
		</button>
	</view>
</template>

<script>
	import { getIncomeSummary } from '../../api/order.js'

	const isPresent = value => value !== undefined && value !== null && value !== ''
	const unwrapData = (response) => {
		if (response && response.code !== undefined && response.code !== 200) {
			throw new Error(response.message || '请求失败')
		}
		return response && response.data !== undefined ? response.data : response
	}

	export default {
		data() {
			return {
				isLoggedIn: false,
				role: 'pilot',
				incomeSummary: {
					totalIncome: 0,
					completedOrderCount: 0
				},
				userInfo: {
					avatarUrl: '',
					nickname: ''
				},
				settings: [
					{ title: '飞手资料', description: '完善姓名、电话与展示信息', url: '/pages/profile/edit-profile', login: true },
					{ title: '服务区域', description: '设置常驻作业地点', url: '/pages/profile/addresses', login: true },
					{ title: '消息通知', description: '管理订单提醒方式', url: '/pages/profile/notifications', login: true },
					{ title: '账号与安全', description: '隐私与登录安全', url: '/pages/profile/security', login: true },
					{ title: '帮助与客服', description: '常见问题与反馈', url: '/pages/profile/help', login: false }
				]
			}
		},
		computed: {
			roleName() {
				return '无人机飞手'
			},
			statusText() {
				return this.isLoggedIn ? `已登录 · ${this.roleName} · 专业服务方` : '登录后使用完整飞手服务'
			}
		},
		onShow() {
			this.isLoggedIn = Boolean(uni.getStorageSync('token'))
			this.role = 'pilot'
			this.userInfo = uni.getStorageSync('userInfo') || {
				avatarUrl: '',
				nickname: ''
			}
			const addresses = uni.getStorageSync('planeServiceAddresses') || []
			const defaultAddress = addresses.find(item => item.isDefault) || addresses[0]
			this.settings[0].description = this.isLoggedIn && this.userInfo.nickname ? this.userInfo.nickname : '完善姓名、电话与展示信息'
			this.settings[1].description = this.isLoggedIn && defaultAddress ? defaultAddress.name : '设置常驻作业地点'
			uni.setStorageSync('planeUserRole', 'pilot')
			uni.setStorageSync('planeUserRoleName', this.roleName)
			if (this.isLoggedIn) {
				this.loadIncomeSummary()
			} else {
				this.incomeSummary = {
					totalIncome: 0,
					completedOrderCount: 0
				}
			}
		},
		methods: {
			loadIncomeSummary() {
				getIncomeSummary().then((response) => {
					const data = unwrapData(response) || {}
					this.incomeSummary = {
						totalIncome: isPresent(data.totalIncome) ? data.totalIncome : 0,
						completedOrderCount: isPresent(data.completedOrderCount) ? data.completedOrderCount : 0
					}
				}).catch(() => {
					uni.showToast({
						title: '收入加载失败',
						icon: 'none'
					})
				})
			},
			formatIncomeValue(value) {
				return isPresent(value) ? value : 0
			},
			openSetting(item) {
				if (item.login && !this.isLoggedIn) {
					uni.showModal({
						title: '登录后使用',
						content: '该功能需要飞手登录后管理。',
						cancelText: '稍后再说',
						confirmText: '去登录',
						success: (result) => {
							if (result.confirm) {
								uni.navigateTo({ url: '/pages/index/index' })
							}
						}
					})
					return
				}
				uni.navigateTo({ url: item.url })
			},
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
		background: #f6f7f4;
	}

	.user-card {
		display: flex;
		align-items: center;
		padding: 38rpx 30rpx;
		border-radius: 26rpx;
		background: linear-gradient(135deg, #111827, #166534);
		box-shadow: 0 22rpx 48rpx rgba(17, 24, 39, 0.15);
	}

	.avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 94rpx;
		height: 94rpx;
		margin-right: 24rpx;
		border: 1rpx solid rgba(255, 255, 255, 0.28);
		border-radius: 50%;
		color: #111827;
		font-size: 38rpx;
		font-weight: 700;
		background: #fff;
		overflow: hidden;
	}

	.avatar-image {
		width: 94rpx;
		height: 94rpx;
	}

	.user-info {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
	}

	.name {
		color: #fff;
		font-size: 35rpx;
		font-weight: 700;
	}

	.verified {
		margin-top: 10rpx;
		color: rgba(255, 255, 255, 0.72);
		font-size: 24rpx;
	}

	.income-card,
	.settings,
	.guest-tip,
	.logout {
		box-shadow: 0 12rpx 32rpx rgba(17, 24, 39, 0.05);
	}

	.income-card {
		display: flex;
		flex-direction: column;
		margin-top: 28rpx;
		padding: 30rpx 28rpx;
		border: 1rpx solid #edf0ed;
		border-radius: 23rpx;
		background: #fff;
	}

	.income-title {
		color: #6b7280;
		font-size: 25rpx;
	}

	.income-amount {
		margin-top: 12rpx;
		color: #166534;
		font-size: 44rpx;
		font-weight: 800;
	}

	.income-desc {
		margin-top: 8rpx;
		color: #8a928d;
		font-size: 23rpx;
	}

	.settings {
		margin-top: 28rpx;
		padding: 0 28rpx;
		border: 1rpx solid #edf0ed;
		border-radius: 23rpx;
		background: #fff;
	}

	.guest-tip {
		margin-top: 28rpx;
		padding: 30rpx 28rpx;
		border-radius: 23rpx;
		color: #6b7280;
		font-size: 27rpx;
		line-height: 44rpx;
		background: #fff;
	}

	.setting-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 110rpx;
		border-bottom: 1rpx solid #edf1ea;
		color: #111827;
		font-size: 28rpx;
	}

	.setting-content {
		display: flex;
		flex-direction: column;
		padding: 18rpx 0;
	}

	.setting-desc {
		margin-top: 8rpx;
		color: #8a928d;
		font-size: 23rpx;
	}

	.setting-row:last-child {
		border-bottom: 0;
	}

	.arrow {
		color: #a5aca5;
		font-size: 38rpx;
	}

	.logout {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 90rpx;
		line-height: 90rpx;
		margin-top: 42rpx;
		border-radius: 18rpx;
		color: #166534;
		font-size: 28rpx;
		font-weight: 600;
		text-align: center;
		background: #fff;
	}

	.logout::after {
		border: none;
	}
</style>
