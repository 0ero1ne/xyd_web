<template>
	<view class="page">
		<view class="card">
			<view class="row" @click="handleWechatAccount"><view><text class="title">微信账号</text><text class="desc">当前飞手账号通过微信登录</text></view><text class="tag">{{ isWechatBound ? '已绑定' : '未绑定' }}</text></view>
			<view class="row last" @click="editProfile"><view><text class="title">联系电话</text><text class="desc">{{ maskedPhone }}</text></view><text class="arrow">›</text></view>
		</view>
		<view class="card">
			<view class="row" @click="privacy"><text class="title">隐私政策与信息使用说明</text><text class="arrow">›</text></view>
			<view class="row last" @click="clearData"><text class="danger">清除本地飞手资料与服务区域</text><text class="arrow">›</text></view>
		</view>
		<button class="logout" @click="logout">退出当前飞手账号</button>
	</view>
</template>
<script>
	import { bindWechatAccount, getAccountInfo } from '../../api/user.js'

	export default {
		data() { return { phone: '', isWechatBound: false, isBindingWechat: false } },
		computed: { maskedPhone() { return this.phone ? (this.phone.includes('*') ? this.phone : `${this.phone.slice(0, 3)}****${this.phone.slice(-4)}`) : '未填写，点击设置' } },
		onShow() { this.loadAccountInfo() },
		methods: {
			getData(response) {
				return response && response.data !== undefined ? response.data : response
			},
			loadAccountInfo() {
				getAccountInfo().then((response) => {
					const data = this.getData(response) || {}
					this.phone = data.maskedPhone || data.phone || ''
					this.isWechatBound = data.wechatBound === true || data.isWechatBound === true || data.wechatBindStatus === '已绑定' || data.bindStatus === '已绑定'
				}).catch(() => {})
			},
			handleWechatAccount() {
				if (this.isWechatBound) {
					uni.showToast({ title: '微信账号已绑定', icon: 'none' })
					return
				}
				if (this.isBindingWechat) return
				this.isBindingWechat = true
				uni.login({
					provider: 'weixin',
					success: async (res) => {
						try {
							if (!res.code) {
								uni.showToast({ title: '未获取到微信授权码', icon: 'none' })
								return
							}
							await bindWechatAccount(res.code)
							uni.showToast({ title: '绑定成功', icon: 'success' })
							this.loadAccountInfo()
						} catch (error) {
							console.error('bindWechatAccount failed', error)
						} finally {
							this.isBindingWechat = false
						}
					},
					fail: () => {
						this.isBindingWechat = false
						uni.showToast({ title: '微信登录失败', icon: 'none' })
					}
				})
			},
			editProfile() { uni.navigateTo({ url: '/pages/profile/edit-profile' }) },
			privacy() { uni.showModal({ title: '信息使用说明', content: '头像、昵称、电话和服务区域用于飞手账号展示、订单沟通与作业服务。', showCancel: false }) },
			clearData() {
				uni.showModal({ title: '清除资料', content: '将清除本地飞手资料和服务区域，是否继续？', success: result => {
					if (!result.confirm) return
					uni.removeStorageSync('userInfo'); uni.removeStorageSync('addressList'); uni.removeStorageSync('planeProfileDetails'); uni.removeStorageSync('planeServiceAddresses'); uni.removeStorageSync('planeNotificationSettings'); this.phone = ''
					uni.showToast({ title: '资料已清除', icon: 'none' })
				} })
			},
			logout() {
				uni.showModal({ title: '退出登录', content: '退出后需要重新登录才能使用飞手接单服务。', success: result => {
					if (!result.confirm) return
					uni.removeStorageSync('token'); uni.removeStorageSync('userInfo'); uni.removeStorageSync('planeUserRole'); uni.removeStorageSync('planeUserRoleName')
					uni.reLaunch({ url: '/pages/index/index' })
				} })
			}
		}
	}
</script>
<style scoped>
	.page { box-sizing: border-box; min-height: 100vh; padding: 28rpx; background: #f6f7f4; }
	.card { margin-bottom: 24rpx; padding: 0 28rpx; border: 1rpx solid #edf0ed; border-radius: 22rpx; background: #fff; box-shadow: 0 12rpx 32rpx rgba(17, 24, 39, 0.05); }
	.row { display: flex; align-items: center; justify-content: space-between; min-height: 104rpx; border-bottom: 1rpx solid #edf1ea; }
	.row.last { border-bottom: none; } .row view { display: flex; flex-direction: column; padding: 18rpx 0; }
	.title, .danger { color: #26372e; font-size: 28rpx; } .danger { color: #b55d50; } .desc { margin-top: 8rpx; color: #7c897f; font-size: 23rpx; }
	.tag { padding: 6rpx 15rpx; border-radius: 22rpx; color: #166534; font-size: 23rpx; background: #e8f4ea; } .arrow { color: #a5aca5; font-size: 38rpx; }
	.logout { display: flex; align-items: center; justify-content: center; width: 100%; height: 90rpx; line-height: 90rpx; margin-top: 40rpx; border-radius: 18rpx; color: #b55d50; font-size: 29rpx; text-align: center; background: #fff; box-shadow: 0 12rpx 32rpx rgba(17, 24, 39, 0.05); } .logout::after { border: none; }
</style>
