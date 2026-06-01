<template>
	<view class="page">
		<view class="avatar-card">
			<button class="avatar" open-type="chooseAvatar" @chooseavatar="chooseAvatar">
				<image v-if="form.avatarUrl" :src="form.avatarUrl" mode="aspectFill"></image>
				<text v-else>选择头像</text>
			</button>
			<text class="hint">用于飞手名片、订单沟通和平台展示</text>
		</view>
		<view class="card">
			<view class="row"><text>昵称</text><input v-model="form.nickname" maxlength="24" placeholder="请输入昵称" /></view>
			<view class="row"><text>真实姓名</text><input v-model="form.realName" maxlength="20" placeholder="选填" /></view>
			<view class="row"><text>联系电话</text><input v-model="form.phone" type="number" maxlength="11" placeholder="请填写手机号" /></view>
			<view class="row last"><text>用户身份</text><text class="value">{{ roleName }}</text></view>
		</view>
		<text class="notice">填写的信息用于飞手接单、作业联络和账号展示，可随时修改。</text>
		<button class="primary" @click="save">保存飞手资料</button>
	</view>
</template>

<script>
	import request from '../../utils/request.js'

	export default {
		data() {
			return { role: 'pilot', form: { avatarUrl: '', nickname: '', realName: '', phone: '', userIdentity: 'pilot' } }
		},
		computed: {
			roleName() {
				return '无人机飞手'
			}
		},
		onLoad() {
			const user = uni.getStorageSync('userInfo') || {}
			this.role = 'pilot'
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
						userIdentity: 'pilot'
					}
					uni.setStorageSync('planeUserRole', 'pilot')
					uni.setStorageSync('planeUserRoleName', this.roleName)
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
						userIdentity: 'pilot'
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
					uni.setStorageSync('planeUserRole', 'pilot')
					uni.setStorageSync('planeUserRoleName', this.roleName)
					uni.showToast({ title: '资料已保存', icon: 'success' })
				}).catch(() => {})
			}
		}
	}
</script>

<style scoped>
	.page { box-sizing: border-box; min-height: 100vh; padding: 28rpx; background: #f6f7f4; }
	.avatar-card, .card { border: 1rpx solid #edf0ed; border-radius: 22rpx; background: #fff; box-shadow: 0 12rpx 32rpx rgba(17, 24, 39, 0.05); }
	.avatar-card { display: flex; flex-direction: column; align-items: center; padding: 36rpx 0 30rpx; }
	.avatar { display: flex; align-items: center; justify-content: center; width: 128rpx; height: 128rpx; padding: 0; border-radius: 50%; color: #166534; font-size: 23rpx; background: #e8f4ea; overflow: hidden; }
	.avatar::after, .primary::after { border: none; }
	.avatar image { width: 128rpx; height: 128rpx; }
	.hint { margin-top: 18rpx; color: #7c897f; font-size: 24rpx; }
	.card { margin-top: 24rpx; padding: 0 28rpx; }
	.row { display: flex; align-items: center; height: 100rpx; border-bottom: 1rpx solid #edf1ea; color: #26372e; font-size: 28rpx; }
	.row > text:first-child { width: 150rpx; }
	.row input { flex: 1; color: #111827; font-size: 28rpx; }
	.row.last { border-bottom: none; }
	.value { flex: 1; color: #6b7280; text-align: right; }
	.notice { display: block; margin: 24rpx 8rpx 34rpx; color: #6b7280; font-size: 24rpx; line-height: 1.6; }
	.primary { display: flex; align-items: center; justify-content: center; width: 100%; height: 92rpx; line-height: 92rpx; border-radius: 18rpx; color: #fff; font-size: 30rpx; font-weight: 600; text-align: center; background: linear-gradient(135deg, #111827, #166534); box-shadow: 0 18rpx 32rpx rgba(17, 24, 39, 0.14); }
</style>
