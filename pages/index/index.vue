<template>
	<view class="login-page">
		<view class="hero">
			<view class="brand">
				<text class="brand-icon">+</text>
			</view>
			<text class="app-name">智慧植保</text>
			<text class="subtitle">连接农户与专业无人机飞手</text>
		</view>

		<view class="login-card">
			<text class="card-title">微信登录</text>
			<text class="card-tip">登录为自愿选择，您也可以先浏览平台服务</text>

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

			<view class="role-list">
				<view
					v-for="role in roles"
					:key="role.value"
					class="role-card"
					:class="{ active: selectedRole === role.value }"
					@click="selectedRole = role.value"
				>
					<view class="role-icon">{{ role.icon }}</view>
					<view class="role-info">
						<text class="role-name">{{ role.label }}</text>
						<text class="role-desc">{{ role.description }}</text>
					</view>
					<view class="radio" :class="{ checked: selectedRole === role.value }">
						<view v-if="selectedRole === role.value" class="radio-dot"></view>
					</view>
				</view>
			</view>

			<checkbox-group class="agreement" @change="onAgreementChange">
				<label class="agreement-label">
					<checkbox value="accepted" :checked="agreementChecked" color="#237a4d" />
					<text>我已阅读并同意</text>
				</label>
				<text class="agreement-link" @click.stop="showDocument('service')">《用户服务协议》</text>
				<text>及</text>
				<text class="agreement-link" @click.stop="showDocument('privacy')">《隐私政策》</text>
			</checkbox-group>

			<button class="login-button" :loading="isLoggingIn" :disabled="isLoggingIn" @click="login">
				{{ isLoggingIn ? '登录中' : '微信登录并进入平台' }}
			</button>
			<button class="browse-button" @click="browseFirst">暂不登录，先浏览服务</button>
		</view>
	</view>
</template>

<script>
	import request from '../../utils/request.js'

	export default {
		data() {
			return {
				selectedRole: 'farmer',
				avatarUrl: '',
				nickname: '',
				agreementChecked: false,
				privacyAuthorized: false,
				isLoggingIn: false,
				roles: [
					{
						value: 'farmer',
						label: '农户',
						icon: '田',
						description: '发布作业需求，查看服务进度'
					},
					{
						value: 'pilot',
						label: '无人机飞手',
						icon: '飞',
						description: '选择附近任务，执行植保作业'
					}
				]
			}
		},
		onShow() {
			const role = uni.getStorageSync('planeUserRole')
			const userInfo = uni.getStorageSync('userInfo')
			if (role) {
				this.selectedRole = role
			}
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
			browseFirst() {
				uni.switchTab({
					url: '/pages/menu/menu'
				})
			},
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
						? '为完成微信登录和展示个人资料，我们会在您同意后收集您选择的头像、昵称及登录凭证，用于账户识别与页面展示。'
						: '使用本平台服务前，请确认您提供的信息真实有效，并遵守平台发布任务及服务交易相关规则。',
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

				const role = this.roles.find(item => item.value === this.selectedRole)
				this.isLoggingIn = true
				// #ifdef MP-WEIXIN
				uni.login({
					provider: 'weixin',
					success: (loginResult) => {
						if (!loginResult.code) {
							this.isLoggingIn = false
							uni.showToast({
								title: '未获取到微信登录凭证，请重试',
								icon: 'none'
							})
							return
						}
						this.requestWxLogin(loginResult.code, role, nickname)
					},
					fail: () => {
						this.isLoggingIn = false
						uni.showToast({
							title: '微信登录失败，请重试',
							icon: 'none'
						})
					}
				})
				// #endif
				// #ifndef MP-WEIXIN
				this.isLoggingIn = false
				uni.showToast({
					title: '请在微信小程序中登录',
					icon: 'none'
				})
				// #endif
			},
			requestWxLogin(code, role, nickname) {
				request({
					url: '/api/auth/wx-login',
					method: 'POST',
					data: {
						code,
						nickname,
						avatarUrl: this.avatarUrl
					}
				}).then((response) => {
					if (response.code !== 200 || !response.data || !response.data.token || !response.data.userInfo) {
						throw new Error(response.message || '登录失败，请重试')
					}
					this.completeLogin(role, response.data)
				}).catch((error) => {
					uni.showToast({
						title: error.message || '登录失败，请重试',
						icon: 'none'
					})
				}).finally(() => {
					this.isLoggingIn = false
				})
			},
			completeLogin(role, loginData) {
				uni.setStorageSync('token', loginData.token)
				uni.setStorageSync('userInfo', loginData.userInfo)
				uni.setStorageSync('planeUserRole', this.selectedRole)
				uni.setStorageSync('planeUserRoleName', role.label)
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
		padding: calc(var(--status-bar-height) + 88rpx) 32rpx 48rpx;
		background: linear-gradient(180deg, #eaf5e9 0%, #f5f7f2 46%, #f5f7f2 100%);
	}

	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 62rpx;
	}

	.brand {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 112rpx;
		height: 112rpx;
		border-radius: 30rpx;
		margin-bottom: 28rpx;
		background: #237a4d;
		box-shadow: 0 18rpx 34rpx rgba(35, 122, 77, 0.2);
	}

	.brand-icon {
		color: #fff;
		font-size: 62rpx;
		font-weight: 300;
		line-height: 1;
	}

	.app-name {
		color: #14251d;
		font-size: 52rpx;
		font-weight: 700;
		letter-spacing: 3rpx;
	}

	.subtitle {
		margin-top: 16rpx;
		color: #6e7c74;
		font-size: 27rpx;
	}

	.login-card {
		padding: 44rpx 30rpx 36rpx;
		border-radius: 30rpx;
		background: #fff;
		box-shadow: 0 10rpx 38rpx rgba(35, 56, 44, 0.06);
	}

	.card-title {
		display: block;
		color: #18261f;
		font-size: 36rpx;
		font-weight: 600;
	}

	.card-tip {
		display: block;
		margin: 10rpx 0 28rpx;
		color: #7b887f;
		font-size: 25rpx;
	}

	.wechat-profile {
		display: flex;
		align-items: center;
		padding: 20rpx;
		margin-bottom: 30rpx;
		border-radius: 20rpx;
		background: #f5f8f4;
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
		background: #e1f2e5;
		overflow: hidden;
	}

	.avatar-picker::after {
		border: none;
	}

	.avatar-disabled {
		box-sizing: border-box;
	}

	.avatar-image {
		width: 92rpx;
		height: 92rpx;
	}

	.avatar-placeholder {
		color: #237a4d;
		font-size: 24rpx;
	}

	.nickname-box {
		flex: 1;
		min-width: 0;
	}

	.profile-label {
		display: block;
		margin-bottom: 10rpx;
		color: #27382f;
		font-size: 25rpx;
	}

	.nickname-input {
		height: 42rpx;
		color: #18261f;
		font-size: 29rpx;
	}

	.role-card {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		height: 132rpx;
		margin-bottom: 22rpx;
		padding: 20rpx;
		border: 2rpx solid #e6eade;
		border-radius: 22rpx;
		background: #fff;
	}

	.role-card.active {
		border-color: #237a4d;
		background: #f0f8f1;
	}

	.role-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 78rpx;
		height: 78rpx;
		border-radius: 18rpx;
		margin-right: 20rpx;
		color: #237a4d;
		font-size: 34rpx;
		font-weight: 600;
		background: #e1f2e5;
	}

	.role-info {
		display: flex;
		flex: 1;
		flex-direction: column;
	}

	.role-name {
		color: #1e3027;
		font-size: 31rpx;
		font-weight: 600;
	}

	.role-desc {
		margin-top: 8rpx;
		color: #76847a;
		font-size: 23rpx;
	}

	.radio {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 34rpx;
		height: 34rpx;
		border: 2rpx solid #cfd7cd;
		border-radius: 50%;
	}

	.radio.checked {
		border-color: #237a4d;
	}

	.radio-dot {
		width: 20rpx;
		height: 20rpx;
		border-radius: 50%;
		background: #237a4d;
	}

	.login-button {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 94rpx;
		margin-top: 28rpx;
		border-radius: 18rpx;
		color: #fff;
		font-size: 31rpx;
		background: #237a4d;
	}

	.login-button::after {
		border: none;
	}

	.browse-button {
		height: 82rpx;
		margin-top: 18rpx;
		color: #237a4d;
		font-size: 28rpx;
		background: transparent;
	}

	.browse-button::after {
		border: none;
	}

	.agreement {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		margin-top: 26rpx;
		color: #7e8b82;
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
		color: #237a4d;
	}
</style>
