<template>
	<view class="page">
		<view class="avatar-card">
			<button class="avatar" open-type="chooseAvatar" @chooseavatar="chooseAvatar">
				<image v-if="form.avatarUrl" :src="form.avatarUrl" mode="aspectFill"></image>
				<text v-else>选择头像</text>
			</button>
			<text class="hint">点击头像可主动更换展示头像</text>
		</view>
		<view class="card">
			<view class="row"><text>昵称</text><input v-model="form.nickname" maxlength="24" placeholder="请输入昵称" /></view>
			<view class="row"><text>真实姓名</text><input v-model="form.realName" maxlength="20" placeholder="选填" /></view>
			<view class="row"><text>联系电话</text><input v-model="form.phone" type="number" maxlength="11" placeholder="请主动填写" /></view>
			<view class="row last"><text>用户身份</text><text class="value">{{ roleName }}</text></view>
		</view>
		<text class="notice">填写的信息用于服务联络，可随时修改。</text>
		<button class="primary" @click="save">保存资料</button>
	</view>
</template>

<script>
	import request from '../../utils/request.js'

	export default {
		data() {
			return { role: 'farmer', form: { avatarUrl: '', nickname: '', realName: '', phone: '', userIdentity: '' } }
		},
		computed: {
			roleName() {
				const identity = this.form.userIdentity || this.role
				if (identity === 'farmer') return '农户用户'
				if (identity === 'pilot') return '无人机飞手'
				return identity
			}
		},
		onLoad() {
			const user = uni.getStorageSync('userInfo') || {}
			this.role = uni.getStorageSync('planeUserRole') || 'farmer'
			this.form.avatarUrl = user.avatarUrl || ''
			this.form.nickname = user.nickname || ''
			this.loadProfile()
		},
		methods: {
			chooseAvatar(event) { this.form.avatarUrl = event.detail.avatarUrl },
			getData(response) {
				return response && response.data !== undefined ? response.data : response
			},
			loadProfile() {
				request({
					url: '/api/user/profile',
					method: 'GET'
				}).then((response) => {
					const data = this.getData(response) || {}
					this.form = {
						avatarUrl: data.avatarUrl || this.form.avatarUrl,
						nickname: data.nickname || this.form.nickname,
						realName: data.realName || '',
						phone: data.phone || '',
						userIdentity: data.userIdentity || ''
					}
					if (data.userIdentity) {
						uni.setStorageSync('planeUserRoleName', data.userIdentity)
					}
				}).catch(() => {})
			},
			save() {
				const nickname = this.form.nickname.trim()
				if (!nickname) return uni.showToast({ title: '请输入昵称', icon: 'none' })
				if (this.form.phone && !/^1\d{10}$/.test(this.form.phone)) return uni.showToast({ title: '手机号格式不正确', icon: 'none' })
				request({
					url: '/api/user/profile',
					method: 'PUT',
					data: {
						nickname,
						avatarUrl: this.form.avatarUrl,
						realName: this.form.realName.trim(),
						phone: this.form.phone,
						userIdentity: this.form.userIdentity || this.role
					}
				}).then(() => {
					uni.setStorageSync('userInfo', {
						...(uni.getStorageSync('userInfo') || {}),
						avatarUrl: this.form.avatarUrl,
						nickname
					})
					uni.setStorageSync('planeProfileDetails', {
						realName: this.form.realName.trim(),
						phone: this.form.phone
					})
					uni.showToast({ title: '资料已保存', icon: 'success' })
				}).catch(() => {})
			}
		}
	}
</script>

<style scoped>
	.page { box-sizing: border-box; min-height: 100vh; padding: 28rpx; background: #f5f7f2; }
	.avatar-card, .card { border-radius: 22rpx; background: #fff; }
	.avatar-card { display: flex; flex-direction: column; align-items: center; padding: 34rpx 0 28rpx; }
	.avatar { display: flex; align-items: center; justify-content: center; width: 126rpx; height: 126rpx; padding: 0; border-radius: 50%; color: #237a4d; font-size: 23rpx; background: #e5f3e8; overflow: hidden; }
	.avatar::after, .primary::after { border: none; }
	.avatar image { width: 126rpx; height: 126rpx; }
	.hint { margin-top: 18rpx; color: #7c897f; font-size: 24rpx; }
	.card { margin-top: 24rpx; padding: 0 28rpx; }
	.row { display: flex; align-items: center; height: 98rpx; border-bottom: 1rpx solid #edf1ea; color: #26372e; font-size: 28rpx; }
	.row > text:first-child { width: 150rpx; }
	.row input { flex: 1; color: #18261f; font-size: 28rpx; }
	.row.last { border-bottom: none; }
	.value { flex: 1; color: #738078; text-align: right; }
	.notice { display: block; margin: 24rpx 8rpx 34rpx; color: #7b887f; font-size: 24rpx; }
	.primary { width: 100%; height: 92rpx; border-radius: 18rpx; color: #fff; font-size: 30rpx; background: #237a4d; }
</style>
