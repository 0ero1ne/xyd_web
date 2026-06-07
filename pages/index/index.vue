<template>
	<view class="login-page">
		<view class="hero">
			<view class="brand-mark">
				<text class="brand-icon">✦</text>
			</view>
			<text class="app-name">云航植保飞手端</text>
			<text class="subtitle">无人机作业接单、履约与账号管理入口</text>
			<view class="hero-metrics">
				<view class="metric">
					<text class="metric-value">24h</text>
					<text class="metric-label">任务响应</text>
				</view>
				<view class="metric">
					<text class="metric-value">LBS</text>
					<text class="metric-label">附近订单</text>
				</view>
				<view class="metric">
					<text class="metric-value">Pilot</text>
					<text class="metric-label">飞手入住</text>
				</view>
			</view>
		</view>

		<view class="login-card">
			<view class="card-head">
				<text class="card-title">飞手微信登录</text>
				<text class="card-tip">仅支持无人机飞手入住，登录后进入接单工作台</text>
			</view>

			<view class="pilot-badge">
				<view class="badge-icon">飞</view>
				<view class="badge-copy">
					<text class="badge-title">专业飞手身份</text>
					<text class="badge-desc">用于承接植保作业、维护资料和接收订单通知</text>
				</view>
			</view>

			<view class="wechat-profile">
				<view v-if="!canCollectProfile" class="avatar-picker avatar-disabled" @click="promptProfileAccess">
					<text class="avatar-placeholder">头像</text>
				</view>
				<button v-else class="avatar-picker" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
					<image v-if="avatarUrl" class="avatar-image" :src="avatarUrl" mode="aspectFill"></image>
					<text v-else class="avatar-placeholder">头像</text>
				</button>
				<view class="nickname-box">
					<text class="profile-label">微信昵称</text>
					<input
						class="nickname-input"
						type="nickname"
						:value="nickname"
						:disabled="!canCollectProfile"
						maxlength="24"
						:placeholder="canCollectProfile ? '点击选择微信昵称' : '请先阅读并同意协议'"
						@input="onNicknameInput"
					/>
				</view>
			</view>

			<checkbox-group class="agreement" @change="onAgreementChange">
				<label class="agreement-label">
					<checkbox value="accepted" :checked="agreementChecked" color="#111827" />
					<text>我已阅读并同意</text>
				</label>
				<text class="agreement-link" @click.stop="showDocument('service')">《用户服务协议》</text>
				<text>及</text>
				<text class="agreement-link" @click.stop="showDocument('privacy')">《隐私政策》</text>
			</checkbox-group>

			<button class="login-button" :loading="isLoggingIn" :disabled="isLoggingIn" @click="login">
				{{ isLoggingIn ? '登录中' : '微信登录并入住飞手端' }}
			</button>
		</view>
	</view>
</template>

<script>
	import request from '../../utils/request.js'

	const PILOT_ROLE = {
		value: 'pilot',
		label: '无人机飞手'
	}

	export default {
		data() {
			return {
				selectedRole: PILOT_ROLE.value,
				avatarUrl: '',
				nickname: '',
				agreementChecked: false,
				privacyAuthorized: false,
				isLoggingIn: false
			}
		},
		onShow() {
			const userInfo = uni.getStorageSync('userInfo')
			this.selectedRole = PILOT_ROLE.value
			if (userInfo) {
				this.avatarUrl = userInfo.avatarUrl || ''
				this.nickname = userInfo.nickname || ''
			}
		},
		computed: {
			canCollectProfile() {
				return this.agreementChecked && this.privacyAuthorized
			}
		},
		methods: {
			onAgreementChange(event) {
				this.agreementChecked = event.detail.value.includes('accepted')
				if (!this.agreementChecked) {
					this.privacyAuthorized = false
					return
				}
				this.requirePrivacyAuthorization()
			},
			promptAgreement() {
				uni.showToast({
					title: '请先阅读并同意协议',
					icon: 'none'
				})
			},
			promptProfileAccess() {
				if (!this.agreementChecked) {
					this.promptAgreement()
					return
				}
				this.requirePrivacyAuthorization()
			},
			requirePrivacyAuthorization() {
				// #ifdef MP-WEIXIN
				if (wx.requirePrivacyAuthorize) {
					wx.requirePrivacyAuthorize({
						success: () => {
							this.privacyAuthorized = true
						},
						fail: () => {
							this.agreementChecked = false
							this.privacyAuthorized = false
							uni.showToast({
								title: '需同意隐私保护指引后继续',
								icon: 'none'
							})
						}
					})
					return
				}
				// #endif
				this.privacyAuthorized = true
			},
			showDocument(type) {
				const isPrivacy = type === 'privacy'
				uni.showModal({
					title: isPrivacy ? '隐私政策' : '用户服务协议',
					content: isPrivacy
						? '为完成微信登录和展示飞手资料，我们会在您同意后收集您选择的头像、昵称及登录凭证，用于账户识别与页面展示。'
						: '使用飞手端服务前，请确认您提供的信息真实有效，并遵守平台接单、履约及服务交易相关规则。',
					showCancel: false,
					confirmText: '我已阅读'
				})
			},
			onChooseAvatar(event) {
				this.avatarUrl = event.detail.avatarUrl
			},
			onNicknameInput(event) {
				this.nickname = event.detail.value
			},
			login() {
				if (this.isLoggingIn) {
					return
				}
				if (!this.agreementChecked) {
					this.promptAgreement()
					return
				}
				if (!this.privacyAuthorized) {
					this.requirePrivacyAuthorization()
					return
				}
				const nickname = this.nickname.trim()
				if (!this.avatarUrl) {
					uni.showToast({
						title: '请选择微信头像',
						icon: 'none'
					})
					return
				}
				if (!nickname) {
					uni.showToast({
						title: '请填写微信昵称',
						icon: 'none'
					})
					return
				}

				this.isLoggingIn = true
				uni.showLoading({
					title: '登录中',
					mask: true
				})
				// #ifdef MP-WEIXIN
				uni.login({
					provider: 'weixin',
					success: (loginResult) => {
						if (!loginResult.code) {
							this.isLoggingIn = false
							uni.hideLoading()
							uni.showToast({
								title: '未获取到微信登录凭证，请重试',
								icon: 'none'
							})
							return
						}
						this.requestWxLogin(loginResult.code, nickname)
					},
					fail: () => {
						this.isLoggingIn = false
						uni.hideLoading()
						uni.showToast({
							title: '微信登录失败，请重试',
							icon: 'none'
						})
					}
				})
				// #endif
				// #ifndef MP-WEIXIN
				this.isLoggingIn = false
				uni.hideLoading()
				uni.showToast({
					title: '请在微信小程序中登录',
					icon: 'none'
				})
				// #endif
			},
			requestWxLogin(code, nickname) {
				request({
					url: '/api/auth/wx-login',
					method: 'POST',
					data: {
						code,
						nickname,
						avatarUrl: this.avatarUrl,
						userIdentity: PILOT_ROLE.value
					}
				}).then((response) => {
					if (response.code !== 200 || !response.data || !response.data.token || !response.data.userInfo) {
						throw new Error(response.message || '登录失败，请重试')
					}
					this.completeLogin(response.data)
				}).catch((error) => {
					uni.showToast({
						title: error.message || '登录失败，请重试',
						icon: 'none'
					})
				}).finally(() => {
					this.isLoggingIn = false
					uni.hideLoading()
				})
			},
			completeLogin(loginData) {
				uni.setStorageSync('token', loginData.token)
				uni.setStorageSync('userInfo', loginData.userInfo)
				uni.setStorageSync('planeUserRole', PILOT_ROLE.value)
				uni.setStorageSync('planeUserRoleName', PILOT_ROLE.label)
				uni.switchTab({
					url: '/pages/menu/menu'
				})
			}
		}
	}
</script>

<style scoped>
	.login-page {
		box-sizing: border-box;
		min-height: 100vh;
		padding: calc(var(--status-bar-height) + 72rpx) 30rpx 52rpx;
		background:
			radial-gradient(circle at 20% 0%, rgba(22, 163, 74, 0.2) 0, rgba(22, 163, 74, 0) 34%),
			linear-gradient(155deg, #101827 0%, #17312e 46%, #eef4ef 47%, #f7f8f5 100%);
	}

	.hero {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: 24rpx 8rpx 42rpx;
	}

	.brand-mark {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 104rpx;
		height: 104rpx;
		border: 1rpx solid rgba(255, 255, 255, 0.28);
		border-radius: 26rpx;
		background: rgba(255, 255, 255, 0.1);
		box-shadow: 0 22rpx 44rpx rgba(0, 0, 0, 0.18);
	}

	.brand-icon {
		color: #d9f99d;
		font-size: 50rpx;
	}

	.app-name {
		margin-top: 32rpx;
		color: #fff;
		font-size: 52rpx;
		font-weight: 700;
		line-height: 1.22;
	}

	.subtitle {
		margin-top: 16rpx;
		color: rgba(255, 255, 255, 0.74);
		font-size: 26rpx;
		line-height: 1.55;
	}

	.hero-metrics {
		display: flex;
		width: 100%;
		margin-top: 38rpx;
		border: 1rpx solid rgba(255, 255, 255, 0.14);
		border-radius: 22rpx;
		background: rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(16rpx);
	}

	.metric {
		flex: 1;
		padding: 22rpx 12rpx;
		text-align: center;
	}

	.metric-value {
		display: block;
		color: #f8fafc;
		font-size: 30rpx;
		font-weight: 700;
	}

	.metric-label {
		display: block;
		margin-top: 8rpx;
		color: rgba(255, 255, 255, 0.62);
		font-size: 21rpx;
	}

	.login-card {
		padding: 38rpx 30rpx 34rpx;
		border: 1rpx solid rgba(15, 23, 42, 0.06);
		border-radius: 28rpx;
		background: rgba(255, 255, 255, 0.96);
		box-shadow: 0 26rpx 70rpx rgba(15, 23, 42, 0.12);
	}

	.card-head {
		margin-bottom: 28rpx;
	}

	.card-title {
		display: block;
		color: #111827;
		font-size: 36rpx;
		font-weight: 700;
	}

	.card-tip {
		display: block;
		margin-top: 10rpx;
		color: #6b7280;
		font-size: 24rpx;
		line-height: 1.5;
	}

	.pilot-badge,
	.wechat-profile {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		border-radius: 22rpx;
		background: #f4f7f4;
	}

	.pilot-badge {
		padding: 22rpx;
		margin-bottom: 22rpx;
		border: 1rpx solid #e5e7eb;
	}

	.badge-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 76rpx;
		height: 76rpx;
		margin-right: 20rpx;
		border-radius: 20rpx;
		color: #f9fafb;
		font-size: 30rpx;
		font-weight: 700;
		background: linear-gradient(135deg, #111827, #166534);
	}

	.badge-copy {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
	}

	.badge-title {
		color: #111827;
		font-size: 29rpx;
		font-weight: 700;
	}

	.badge-desc {
		margin-top: 8rpx;
		color: #6b7280;
		font-size: 23rpx;
		line-height: 1.45;
	}

	.wechat-profile {
		padding: 20rpx;
		margin-bottom: 26rpx;
	}

	.avatar-picker {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 92rpx;
		height: 92rpx;
		padding: 0;
		margin: 0 22rpx 0 0;
		border-radius: 50%;
		background: #e5efe8;
		overflow: hidden;
	}

	.avatar-picker::after,
	.login-button::after {
		border: none;
	}

	.avatar-image {
		width: 92rpx;
		height: 92rpx;
	}

	.avatar-placeholder {
		color: #166534;
		font-size: 24rpx;
	}

	.nickname-box {
		flex: 1;
		min-width: 0;
	}

	.profile-label {
		display: block;
		margin-bottom: 10rpx;
		color: #374151;
		font-size: 24rpx;
	}

	.nickname-input {
		height: 44rpx;
		color: #111827;
		font-size: 29rpx;
	}

	.agreement {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		margin-top: 8rpx;
		color: #6b7280;
		font-size: 22rpx;
		line-height: 40rpx;
	}

	.agreement-label {
		display: flex;
		align-items: center;
	}

	.agreement-label checkbox {
		margin-right: 5rpx;
		transform: scale(0.72);
	}

	.agreement-link {
		color: #166534;
		font-weight: 600;
	}

	.login-button {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 94rpx;
		line-height: 94rpx;
		margin-top: 30rpx;
		border-radius: 18rpx;
		color: #fff;
		font-size: 31rpx;
		font-weight: 600;
		text-align: center;
		background: linear-gradient(135deg, #111827, #166534);
		box-shadow: 0 18rpx 32rpx rgba(17, 24, 39, 0.18);
	}
</style>
