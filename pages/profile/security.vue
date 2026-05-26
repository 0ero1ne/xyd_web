<template>
	<view class="page">
		<view class="card">
			<view class="row"><view><text class="title">微信账号</text><text class="desc">当前账号通过微信登录</text></view><text class="tag">{{ isWechatBound ? '已绑定' : '未绑定' }}</text></view>
			<view class="row last" @click="editProfile"><view><text class="title">联系电话</text><text class="desc">{{ maskedPhone }}</text></view><text class="arrow">›</text></view>
		</view>
		<view class="card">
			<view class="row" @click="privacy"><text class="title">隐私政策与信息使用说明</text><text class="arrow">›</text></view>
			<view class="row last" @click="clearData"><text class="danger">清除本地个人资料与地址</text><text class="arrow">›</text></view>
		</view>
		<button class="logout" @click="logout">退出当前账号</button>
	</view>
</template>
<script>
	import request from '../../utils/request.js'

	export default {
		data() { return { phone: '', isWechatBound: false } },
		computed: { maskedPhone() { return this.phone ? (this.phone.includes('*') ? this.phone : `${this.phone.slice(0, 3)}****${this.phone.slice(-4)}`) : '未填写，点击设置' } },
		onShow() { this.loadAccount() },
		methods: {
			getData(response) {
				return response && response.data !== undefined ? response.data : response
			},
			loadAccount() {
				request({
					url: '/api/user/account',
					method: 'GET'
				}).then((response) => {
					const data = this.getData(response) || {}
					this.phone = data.maskedPhone || data.phone || ''
					this.isWechatBound = data.wechatBound === true || data.isWechatBound === true || data.wechatBindStatus === '已绑定' || data.bindStatus === '已绑定'
				}).catch(() => {})
			},
			editProfile() { uni.navigateTo({ url: '/pages/profile/edit-profile' }) },
			privacy() { uni.showModal({ title: '信息使用说明', content: '头像、昵称和主动填写的电话用于账户展示及服务联络；地址用于作业服务。', showCancel: false }) },
			clearData() {
				uni.showModal({ title: '清除资料', content: '将清除您填写的个人资料和服务地址，是否继续？', success: result => {
					if (!result.confirm) return
					uni.removeStorageSync('userInfo'); uni.removeStorageSync('addressList'); uni.removeStorageSync('planeProfileDetails'); uni.removeStorageSync('planeServiceAddresses'); uni.removeStorageSync('planeNotificationSettings'); this.phone = ''
					uni.showToast({ title: '资料已清除', icon: 'none' })
				} })
			},
			logout() {
				uni.showModal({ title: '退出登录', content: '退出后仍可继续浏览公开服务内容。', success: result => {
					if (!result.confirm) return
					uni.removeStorageSync('token'); uni.removeStorageSync('userInfo'); uni.removeStorageSync('planeUserRole'); uni.removeStorageSync('planeUserRoleName')
					uni.reLaunch({ url: '/pages/index/index' })
				} })
			}
		}
	}
</script>
<style scoped>
	.page { box-sizing: border-box; min-height: 100vh; padding: 28rpx; background: #f5f7f2; }
	.card { margin-bottom: 24rpx; padding: 0 28rpx; border-radius: 22rpx; background: #fff; }
	.row { display: flex; align-items: center; justify-content: space-between; min-height: 102rpx; border-bottom: 1rpx solid #edf1ea; }
	.row.last { border-bottom: none; } .row view { display: flex; flex-direction: column; padding: 18rpx 0; }
	.title, .danger { color: #26372e; font-size: 28rpx; } .danger { color: #b55d50; } .desc { margin-top: 8rpx; color: #7c897f; font-size: 23rpx; }
	.tag { padding: 6rpx 15rpx; border-radius: 22rpx; color: #237a4d; font-size: 23rpx; background: #e8f4ea; } .arrow { color: #a5aca5; font-size: 38rpx; }
	.logout { width: 100%; height: 90rpx; margin-top: 40rpx; border-radius: 18rpx; color: #b55d50; font-size: 29rpx; background: #fff; } .logout::after { border: none; }
</style>
