<template>
	<view class="page">
		<view class="status-tabs">
			<text
				v-for="tab in tabs"
				:key="tab.value"
				class="status-tab"
				:class="{ active: activeStatus === tab.value }"
				@click="changeTab(tab.value)"
			>{{ tab.label }}</text>
		</view>

		<view v-if="loading && page === 1" class="state-card">加载中...</view>
		<view v-else-if="!orders.length" class="state-card">暂无订单</view>
		<view v-else>
			<view v-for="order in orders" :key="order.orderId || order.orderNo" class="order-card">
				<view class="order-top">
					<text class="order-number">订单 {{ formatOrderNo(order.orderNo) }}</text>
					<text class="status" :class="statusClass(order)">{{ formatStatusLabel(order) }}</text>
				</view>
				<text class="crop">{{ order.taskTitle || '未命名任务' }}</text>
				<text class="meta">{{ order.locationName || '未知地点' }} · {{ formatArea(order.areaMu) }}</text>
				<view class="order-bottom">
					<text class="date">{{ formatOrderTime(order) }}</text>
					<view class="order-actions">
						<text class="amount">{{ formatIncome(order) }}</text>
						<button
							v-if="canComplete(order)"
							class="complete-button"
							:disabled="completingOrderId === order.orderId"
							@click.stop="handleCompleteOrder(order)"
						>完成</button>
						<button
							v-if="canCancel(order)"
							class="cancel-button"
							:disabled="cancelingOrderId === order.orderId"
							@click.stop="handleCancelOrder(order)"
						>取消</button>
					</view>
				</view>
			</view>

			<view v-if="loading" class="load-more">加载中...</view>
			<view v-else-if="!hasMore" class="load-more">没有更多了</view>
		</view>
	</view>
</template>

<script>
	import { cancelOrder, completeOrder, getMyOrders } from '../../api/order.js'

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
				activeStatus: 'all',
				tabs: [
					{ label: '全部', value: 'all' },
					{ label: '进行中', value: 'running' },
					{ label: '已完成', value: 'completed' }
				],
				orders: [],
				loading: false,
				completingOrderId: null,
				cancelingOrderId: null,
				page: 1,
				size: 10,
				hasMore: true
			}
		},
		onShow() {
			this.activeStatus = 'all'
			this.loadOrders(true)
		},
		onPullDownRefresh() {
			this.loadOrders(true).finally(() => {
				uni.stopPullDownRefresh()
			})
		},
		onReachBottom() {
			if (!this.loading && this.hasMore) {
				this.loadOrders(false)
			}
		},
		methods: {
			changeTab(status) {
				if (this.activeStatus === status) {
					return
				}
				this.activeStatus = status
				this.loadOrders(true)
			},
			loadOrders(reset = false) {
				if (this.loading) {
					return Promise.resolve()
				}
				if (reset) {
					this.page = 1
					this.hasMore = true
				}
				this.loading = true
				return getMyOrders({
					status: this.activeStatus,
					page: this.page,
					size: this.size
				}).then((response) => {
					const data = unwrapData(response) || {}
					const records = Array.isArray(data.records) ? data.records : []
					this.orders = reset ? records : this.orders.concat(records)
					const total = Number(data.total || 0)
					const currentPage = Number(data.page || this.page)
					const pageSize = Number(data.size || this.size)
					this.page = currentPage + 1
					this.hasMore = total ? this.orders.length < total : records.length >= pageSize
				}).catch(() => {
					if (reset) {
						this.orders = []
					}
					uni.showToast({
						title: '订单加载失败',
						icon: 'none'
					})
				}).finally(() => {
					this.loading = false
				})
			},
			formatOrderNo(orderNo) {
				if (!orderNo) {
					return '--'
				}
				const text = String(orderNo)
				return text.length > 10 ? text.slice(-10) : text
			},
			formatArea(areaMu) {
				return `${isPresent(areaMu) ? areaMu : '--'} 亩`
			},
			formatIncome(order) {
				const income = isPresent(order.actualIncome) ? order.actualIncome : order.expectedIncome
				return `¥${isPresent(income) ? income : '--'}`
			},
			formatOrderTime(order) {
				const time = order.completedTime || order.acceptedTime || order.createTime
				if (!time) {
					return '--'
				}
				const date = new Date(String(time).replace(/-/g, '/'))
				if (Number.isNaN(date.getTime())) {
					return '--'
				}
				const month = String(date.getMonth() + 1).padStart(2, '0')
				const day = String(date.getDate()).padStart(2, '0')
				const hour = String(date.getHours()).padStart(2, '0')
				const minute = String(date.getMinutes()).padStart(2, '0')
				return `${month}-${day} ${hour}:${minute}`
			},
			formatStatusLabel(order) {
				if (order && order.statusLabel) {
					return order.statusLabel
				}
				const statusMap = {
					0: '已取消',
					1: '进行中',
					2: '进行中',
					3: '已完成'
				}
				return statusMap[order && order.orderStatus] || '未知'
			},
			statusClass(order) {
				const label = order.statusLabel || ''
				if (label.indexOf('取消') !== -1 || order.orderStatus === 0) {
					return 'cancelled'
				}
				if (label.indexOf('完成') !== -1 || order.orderStatus === 3) {
					return 'completed'
				}
				return 'running'
			},
			canComplete(order) {
				return order && (order.orderStatus === 1 || order.orderStatus === 2)
			},
			canCancel(order) {
				return order && (order.orderStatus === 1 || order.orderStatus === 2)
			},
			handleCompleteOrder(order) {
				if (!order || !order.orderId || this.completingOrderId) {
					return
				}
				uni.showModal({
					title: '确认完成',
					content: '确认该任务已经完成吗？',
					success: (result) => {
						if (result.confirm) {
							this.submitCompleteOrder(order.orderId)
						}
					}
				})
			},
			submitCompleteOrder(orderId) {
				this.completingOrderId = orderId
				completeOrder(orderId).then((response) => {
					unwrapData(response)
					uni.showToast({
						title: '已完成',
						icon: 'success'
					})
					this.loadOrders(true)
				}).catch(() => {
					uni.showToast({
						title: '订单操作失败',
						icon: 'none'
					})
				}).finally(() => {
					this.completingOrderId = null
				})
			},
			handleCancelOrder(order) {
				if (!order || !order.orderId || this.cancelingOrderId) {
					return
				}
				uni.showModal({
					title: '确认取消',
					content: '取消后该订单将不计入收入，是否继续？',
					success: (result) => {
						if (result.confirm) {
							this.submitCancelOrder(order.orderId)
						}
					}
				})
			},
			submitCancelOrder(orderId) {
				const cancelReason = '用户主动取消'
				this.cancelingOrderId = orderId
				cancelOrder(orderId, cancelReason).then((response) => {
					unwrapData(response)
					uni.showToast({
						title: '已取消',
						icon: 'success'
					})
					this.loadOrders(true)
				}).catch(() => {
					uni.showToast({
						title: '订单操作失败',
						icon: 'none'
					})
				}).finally(() => {
					this.cancelingOrderId = null
				})
			}
		}
	}
</script>

<style scoped>
	.page {
		box-sizing: border-box;
		min-height: 100vh;
		padding: 24rpx 28rpx 48rpx;
		background: #f6f7f4;
	}

	.status-tabs {
		display: flex;
		padding: 8rpx;
		margin-bottom: 28rpx;
		border-radius: 18rpx;
		background: #fff;
		box-shadow: 0 12rpx 32rpx rgba(17, 24, 39, 0.05);
	}

	.status-tab {
		flex: 1;
		padding: 20rpx 0;
		border-radius: 13rpx;
		color: #758278;
		font-size: 27rpx;
		text-align: center;
	}

	.status-tab.active {
		color: #111827;
		font-weight: 700;
		background: #edf6ef;
	}

	.order-card {
		display: flex;
		flex-direction: column;
		margin-bottom: 20rpx;
		padding: 28rpx;
		border: 1rpx solid #edf0ed;
		border-radius: 22rpx;
		background: #fff;
		box-shadow: 0 12rpx 32rpx rgba(17, 24, 39, 0.05);
	}

	.order-top,
	.order-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.order-number,
	.date {
		color: #7c897f;
		font-size: 23rpx;
	}

	.status {
		padding: 8rpx 15rpx;
		border-radius: 20rpx;
		font-size: 23rpx;
	}

	.status.running {
		color: #166534;
		background: #e8f4ea;
	}

	.status.completed {
		color: #2f5d43;
		background: #eef6ef;
	}

	.status.cancelled {
		color: #6b7280;
		background: #f1f2f3;
	}

	.crop {
		margin-top: 27rpx;
		color: #111827;
		font-size: 31rpx;
		font-weight: 700;
	}

	.meta {
		margin: 12rpx 0 30rpx;
		color: #6b7280;
		font-size: 25rpx;
	}

	.order-bottom {
		padding-top: 22rpx;
		border-top: 1rpx solid #eff2ec;
	}

	.amount {
		color: #166534;
		font-size: 29rpx;
		font-weight: 800;
	}

	.order-actions {
		display: flex;
		align-items: center;
	}

	.complete-button,
	.cancel-button {
		margin: 0 0 0 18rpx;
		padding: 0 24rpx;
		min-width: 100rpx;
		height: 56rpx;
		line-height: 56rpx;
		border-radius: 14rpx;
		font-size: 24rpx;
		font-weight: 600;
	}

	.complete-button {
		color: #fff;
		background: #166534;
	}

	.cancel-button {
		color: #6b7280;
		background: #f1f2f3;
	}

	.complete-button::after,
	.cancel-button::after {
		border: none;
	}

	.state-card,
	.load-more {
		display: flex;
		align-items: center;
		justify-content: center;
		color: #7a8380;
		font-size: 27rpx;
	}

	.state-card {
		min-height: 180rpx;
		border: 1rpx solid #edf0ed;
		border-radius: 22rpx;
		background: #fff;
		box-shadow: 0 12rpx 32rpx rgba(17, 24, 39, 0.05);
	}

	.load-more {
		padding: 20rpx 0 8rpx;
		font-size: 24rpx;
	}
</style>
