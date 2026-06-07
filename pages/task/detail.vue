<template>
	<view class="page">
		<view v-if="loading" class="state-card">加载中...</view>
		<view v-else-if="!task.id" class="state-card">暂无任务详情</view>
		<view v-else class="content">
			<view class="header">
				<view class="title-row">
					<text class="title">{{ task.taskTitle || '未命名任务' }}</text>
					<text class="status" :class="{ available: canAccept }">{{ formatStatus(task) }}</text>
				</view>
				<text class="income">{{ formatMoney(task.expectedIncome) }}</text>
			</view>

			<view class="section">
				<text class="section-title">作业信息</text>
				<view class="info-row">
					<text class="label">地点</text>
					<text class="value">{{ joinAddress(task.locationName, task.detailAddress) }}</text>
				</view>
				<view class="info-row">
					<text class="label">距离</text>
					<text class="value">{{ formatUnit(task.distanceKm, 'km') }}</text>
				</view>
				<view class="info-row">
					<text class="label">面积</text>
					<text class="value">{{ formatUnit(task.areaMu, '亩') }}</text>
				</view>
				<view class="info-row">
					<text class="label">作物类型</text>
					<text class="value">{{ formatText(task.cropType) }}</text>
				</view>
				<view class="info-row">
					<text class="label">服务类型</text>
					<text class="value">{{ formatText(task.serviceType) }}</text>
				</view>
			</view>

			<view class="section">
				<text class="section-title">时间要求</text>
				<view class="info-row">
					<text class="label">计划开始</text>
					<text class="value">{{ formatTime(task.plannedStartTime) }}</text>
				</view>
				<view class="info-row">
					<text class="label">计划结束</text>
					<text class="value">{{ formatTime(task.plannedEndTime) }}</text>
				</view>
				<view class="info-row">
					<text class="label">接单截止</text>
					<text class="value">{{ formatTime(task.deadlineTime) }}</text>
				</view>
			</view>

			<view class="section">
				<text class="section-title">物资要求</text>
				<view class="info-row">
					<text class="label">所需电池</text>
					<text class="value">{{ formatUnit(task.requiredBatteryCount, '组') }}</text>
				</view>
				<view class="info-row">
					<text class="label">药剂名称</text>
					<text class="value">{{ formatText(task.pesticideName) }}</text>
				</view>
				<view class="info-row">
					<text class="label">药剂用量</text>
					<text class="value">{{ formatText(task.pesticideDosage) }}</text>
				</view>
			</view>

			<view class="section">
				<text class="section-title">任务说明</text>
				<view v-if="tags.length" class="tags">
					<text v-for="tag in tags" :key="tag" class="tag">{{ tag }}</text>
				</view>
				<text class="description">{{ formatText(task.description) }}</text>
			</view>

			<view class="section">
				<text class="section-title">联系人</text>
				<view class="info-row">
					<text class="label">联系人</text>
					<text class="value">{{ formatText(task.contactName) }}</text>
				</view>
				<view class="info-row">
					<text class="label">联系电话</text>
					<text class="value">{{ formatText(task.contactPhone) }}</text>
				</view>
			</view>
		</view>

		<view class="bottom-bar">
			<button
				class="accept-button"
				:class="{ disabled: !canAccept }"
				:disabled="!canAccept || accepting"
				@click="handleAccept"
			>{{ canAccept ? '确认接单' : '当前任务不可接单' }}</button>
		</view>
	</view>
</template>

<script>
	import { getTaskDetail } from '../../api/task.js'
	import { acceptTask } from '../../api/order.js'

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
				taskId: '',
				task: {},
				loading: false,
				accepting: false
			}
		},
		computed: {
			canAccept() {
				return this.task && Number(this.task.status) === 1
			},
			tags() {
				const tags = this.task && this.task.tags
				if (Array.isArray(tags)) {
					return tags.filter(Boolean)
				}
				if (typeof tags === 'string') {
					return tags.split(',').map(item => item.trim()).filter(Boolean)
				}
				return []
			}
		},
		onLoad(options) {
			this.taskId = options && options.id ? options.id : ''
			this.loadTaskDetail()
		},
		methods: {
			loadTaskDetail() {
				if (this.loading) {
					return
				}
				if (!this.taskId) {
					uni.showToast({
						title: '任务详情加载失败',
						icon: 'none'
					})
					return
				}
				this.loading = true
				wx.showLoading({
					title: '加载中',
					mask: true
				})
				getTaskDetail(this.taskId).then((response) => {
					this.task = unwrapData(response) || {}
				}).catch(() => {
					this.task = {}
					uni.showToast({
						title: '任务详情加载失败',
						icon: 'none'
					})
				}).finally(() => {
					wx.hideLoading()
					this.loading = false
				})
			},
			handleAccept() {
				if (!this.canAccept || this.accepting) {
					return
				}
				uni.showModal({
					title: '确认接单',
					content: '是否确认接受该任务？',
					success: (result) => {
						if (result.confirm) {
							this.submitAccept()
						}
					}
				})
			},
			submitAccept() {
				this.accepting = true
				acceptTask(this.taskId).then((response) => {
					unwrapData(response)
					uni.showToast({
						title: '接单成功',
						icon: 'success'
					})
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/orders/orders'
						})
					}, 500)
				}).catch((error) => {
					uni.showToast({
						title: error && error.message ? error.message : '接单失败',
						icon: 'none'
					})
				}).finally(() => {
					this.accepting = false
				})
			},
			formatText(value) {
				return isPresent(value) ? value : '--'
			},
			formatUnit(value, unit) {
				return isPresent(value) ? `${value}${unit}` : '--'
			},
			formatMoney(value) {
				return `¥${isPresent(value) ? value : '--'}`
			},
			formatStatus(task) {
				if (task && task.statusLabel) {
					return task.statusLabel
				}
				const statusMap = {
					1: '待接单',
					2: '已接单',
					3: '进行中',
					4: '已完成',
					5: '已取消'
				}
				return statusMap[task && Number(task.status)] || '未知状态'
			},
			formatTime(value) {
				if (!value) {
					return '--'
				}
				const date = new Date(String(value).replace(/-/g, '/'))
				if (Number.isNaN(date.getTime())) {
					return value
				}
				const year = date.getFullYear()
				const month = String(date.getMonth() + 1).padStart(2, '0')
				const day = String(date.getDate()).padStart(2, '0')
				const hour = String(date.getHours()).padStart(2, '0')
				const minute = String(date.getMinutes()).padStart(2, '0')
				return `${year}-${month}-${day} ${hour}:${minute}`
			},
			joinAddress(locationName, detailAddress) {
				if (locationName && detailAddress && locationName !== detailAddress) {
					return `${locationName} ${detailAddress}`
				}
				return locationName || detailAddress || '--'
			}
		}
	}
</script>

<style scoped>
	.page {
		box-sizing: border-box;
		min-height: 100vh;
		padding: 24rpx 28rpx 150rpx;
		background: #f6f7f4;
	}

	.content {
		display: flex;
		flex-direction: column;
	}

	.header,
	.section,
	.state-card {
		border: 1rpx solid #edf0ed;
		border-radius: 22rpx;
		background: #fff;
		box-shadow: 0 12rpx 32rpx rgba(17, 24, 39, 0.05);
	}

	.header {
		padding: 30rpx 28rpx;
	}

	.title-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
	}

	.title {
		flex: 1;
		min-width: 0;
		color: #111827;
		font-size: 34rpx;
		font-weight: 700;
		line-height: 1.35;
	}

	.status {
		margin-left: 18rpx;
		padding: 8rpx 16rpx;
		border-radius: 18rpx;
		color: #6b7280;
		font-size: 23rpx;
		background: #f1f2f3;
		white-space: nowrap;
	}

	.status.available {
		color: #166534;
		background: #e8f4ea;
	}

	.income {
		display: block;
		margin-top: 24rpx;
		color: #166534;
		font-size: 42rpx;
		font-weight: 800;
	}

	.section {
		margin-top: 20rpx;
		padding: 28rpx;
	}

	.section-title {
		display: block;
		margin-bottom: 18rpx;
		color: #111827;
		font-size: 29rpx;
		font-weight: 700;
	}

	.info-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 16rpx 0;
		border-top: 1rpx solid #eff2ec;
	}

	.info-row:first-of-type {
		border-top: none;
	}

	.label {
		flex: 0 0 180rpx;
		color: #7c897f;
		font-size: 25rpx;
	}

	.value {
		flex: 1;
		color: #111827;
		font-size: 26rpx;
		line-height: 1.45;
		text-align: right;
		word-break: break-all;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		margin-bottom: 12rpx;
	}

	.tag {
		margin: 0 10rpx 10rpx 0;
		padding: 6rpx 14rpx;
		border-radius: 999rpx;
		color: #166534;
		font-size: 21rpx;
		background: #edf7ef;
	}

	.description {
		color: #374151;
		font-size: 26rpx;
		line-height: 1.6;
	}

	.state-card {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 180rpx;
		color: #7a8380;
		font-size: 27rpx;
	}

	.bottom-bar {
		position: fixed;
		right: 0;
		bottom: 0;
		left: 0;
		box-sizing: border-box;
		padding: 18rpx 28rpx calc(18rpx + env(safe-area-inset-bottom));
		background: #fff;
		box-shadow: 0 -10rpx 26rpx rgba(17, 24, 39, 0.08);
	}

	.accept-button {
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0;
		height: 88rpx;
		line-height: 88rpx;
		border-radius: 16rpx;
		color: #fff;
		font-size: 30rpx;
		font-weight: 700;
		background: #166534;
	}

	.accept-button.disabled {
		color: #8b9490;
		background: #edf0ed;
	}

	.accept-button::after {
		border: none;
	}
</style>
