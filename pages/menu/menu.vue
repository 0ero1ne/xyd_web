<template>
	<view class="page">
		<view class="workbench">
			<view class="workbench-top">
				<view>
					<text class="eyebrow">飞手服务台</text>
					<text class="headline">发现附近待接任务</text>
				</view>
				<text class="status-pill">{{ isLoggedIn ? '已登录' : '未登录' }}</text>
			</view>
			<text class="caption">确认作物、面积、距离和报价，快速承接适合您的植保作业。</text>
			<button class="action-button" @click="handleAction">{{ isLoggedIn ? '查看可接订单' : '登录后接单' }}</button>
		</view>

		<view class="quick-grid">
			<view v-for="item in stats" :key="item.label" class="quick-item">
				<text class="quick-value">{{ item.value }}</text>
				<text class="quick-label">{{ item.label }}</text>
			</view>
		</view>

		<view class="section-heading">
			<text class="section-title">推荐任务</text>
			<text class="more" @click="loadRecommendTasks">刷新</text>
		</view>

		<view v-if="tasksLoading" class="state-card">任务加载中...</view>
		<view v-else-if="!items.length" class="state-card">暂无推荐任务</view>
		<view v-else>
			<view
				v-for="item in items"
				:key="item.id || item.taskNo"
				class="task-card"
				@click="handleAcceptTask(item)"
			>
				<view class="task-main">
					<text class="task-title">{{ item.title }}</text>
					<text class="task-detail">{{ item.detail }}</text>
					<view v-if="item.tags.length" class="tags">
						<text v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</text>
					</view>
				</view>
				<view class="task-side">
					<text class="price">{{ item.price }}</text>
					<button class="accept-button" @click.stop="handleAcceptTask(item)">接单</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getRecommendTasks, getTaskSummary } from '../../api/task.js'
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
				isLoggedIn: false,
				summaryLoading: false,
				tasksLoading: false,
				acceptingTaskId: null,
				stats: [
					{ value: '--km', label: '最近任务' },
					{ value: '--亩', label: '单次面积' },
					{ value: '¥--', label: '预估收入' }
				],
				items: []
			}
		},
		onShow() {
			this.isLoggedIn = Boolean(uni.getStorageSync('token'))
			uni.setStorageSync('planeUserRole', 'pilot')
			uni.setStorageSync('planeUserRoleName', '无人机飞手')
			this.loadWorkbenchData()
		},
		methods: {
			loadWorkbenchData() {
				this.loadSummary()
				this.loadRecommendTasks()
			},
			loadSummary() {
				this.summaryLoading = true
				getTaskSummary().then((response) => {
					this.stats = this.formatSummary(unwrapData(response) || {})
				}).catch(() => {
					uni.showToast({
						title: '任务加载失败',
						icon: 'none'
					})
				}).finally(() => {
					this.summaryLoading = false
				})
			},
			loadRecommendTasks() {
				this.tasksLoading = true
				getRecommendTasks().then((response) => {
					const data = unwrapData(response)
					const list = Array.isArray(data) ? data : []
					this.items = list.map(item => this.formatTask(item))
				}).catch(() => {
					this.items = []
					uni.showToast({
						title: '任务加载失败',
						icon: 'none'
					})
				}).finally(() => {
					this.tasksLoading = false
				})
			},
			formatSummary(summary) {
				return [
					{ value: `${isPresent(summary.nearestDistanceKm) ? summary.nearestDistanceKm : '--'}km`, label: '最近任务' },
					{ value: `${isPresent(summary.maxAreaMu) ? summary.maxAreaMu : '--'}亩`, label: '单次面积' },
					{ value: `¥${isPresent(summary.maxExpectedIncome) ? summary.maxExpectedIncome : '--'}`, label: '预估收入' }
				]
			},
			formatTask(task) {
				return {
					id: task.id || task.taskId,
					taskNo: task.taskNo,
					title: task.taskTitle || '未命名任务',
					detail: `${task.locationName || '未知地点'} · 距您 ${isPresent(task.distanceKm) ? task.distanceKm : '--'}km · ${isPresent(task.areaMu) ? task.areaMu : '--'} 亩`,
					price: `¥${isPresent(task.expectedIncome) ? task.expectedIncome : '--'}`,
					tags: this.resolveTags(task)
				}
			},
			resolveTags(task) {
				if (Array.isArray(task.tags) && task.tags.length) {
					return task.tags.filter(Boolean)
				}
				return [
					task.cropType,
					task.serviceType,
					isPresent(task.requiredBatteryCount) ? `需电池${task.requiredBatteryCount}组` : ''
				].filter(Boolean)
			},
			handleAction() {
				if (this.isLoggedIn) {
					this.loadRecommendTasks()
					return
				}

				uni.showModal({
					title: '登录后接单',
					content: '飞手接单、资料维护和订单通知需要登录后使用。',
					cancelText: '稍后再说',
					confirmText: '去登录',
					success: (result) => {
						if (result.confirm) {
							uni.navigateTo({
								url: '/pages/index/index'
							})
						}
					}
				})
			},
			handleAcceptTask(item) {
				if (!this.isLoggedIn) {
					this.handleAction()
					return
				}
				if (!item.id || this.acceptingTaskId) {
					return
				}

				uni.showModal({
					title: '确认接单',
					content: '是否确认接受该任务？',
					success: (result) => {
						if (result.confirm) {
							this.submitAcceptTask(item.id)
						}
					}
				})
			},
			submitAcceptTask(taskId) {
				this.acceptingTaskId = taskId
				acceptTask(taskId).then((response) => {
					unwrapData(response)
					uni.showToast({
						title: '接单成功',
						icon: 'success'
					})
					this.loadRecommendTasks()
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/orders/orders'
						})
					}, 500)
				}).catch((error) => {
					const message = error && error.message ? error.message : ''
					uni.showToast({
						title: message.indexOf('不可接') !== -1 || message.indexOf('已被接') !== -1 ? '任务已被接单' : '任务已被接单',
						icon: 'none'
					})
				}).finally(() => {
					this.acceptingTaskId = null
				})
			}
		}
	}
</script>

<style scoped>
	.page {
		box-sizing: border-box;
		min-height: 100vh;
		padding: 28rpx 28rpx 50rpx;
		background: #f6f7f4;
	}

	.workbench {
		display: flex;
		flex-direction: column;
		padding: 38rpx 32rpx;
		border-radius: 28rpx;
		color: #fff;
		background:
			linear-gradient(135deg, rgba(17, 24, 39, 0.96), rgba(22, 101, 52, 0.94)),
			linear-gradient(90deg, #111827, #166534);
		box-shadow: 0 24rpx 54rpx rgba(17, 24, 39, 0.16);
	}

	.workbench-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
	}

	.eyebrow {
		display: block;
		color: rgba(255, 255, 255, 0.66);
		font-size: 24rpx;
	}

	.headline {
		display: block;
		margin-top: 14rpx;
		font-size: 42rpx;
		font-weight: 700;
	}

	.status-pill {
		padding: 8rpx 18rpx;
		border: 1rpx solid rgba(255, 255, 255, 0.22);
		border-radius: 999rpx;
		color: rgba(255, 255, 255, 0.82);
		font-size: 22rpx;
	}

	.caption {
		margin: 16rpx 0 34rpx;
		color: rgba(255, 255, 255, 0.72);
		font-size: 25rpx;
		line-height: 1.55;
	}

	.action-button {
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0;
		height: 82rpx;
		line-height: 82rpx;
		border-radius: 16rpx;
		color: #111827;
		font-size: 28rpx;
		font-weight: 600;
		text-align: center;
		background: #fff;
	}

	.action-button::after,
	.accept-button::after {
		border: none;
	}

	.quick-grid {
		display: flex;
		margin-top: 22rpx;
		padding: 10rpx;
		border-radius: 24rpx;
		background: #fff;
		box-shadow: 0 14rpx 36rpx rgba(17, 24, 39, 0.06);
	}

	.quick-item {
		flex: 1;
		padding: 20rpx 8rpx;
		text-align: center;
	}

	.quick-value {
		display: block;
		color: #111827;
		font-size: 29rpx;
		font-weight: 700;
	}

	.quick-label {
		display: block;
		margin-top: 8rpx;
		color: #7a8380;
		font-size: 22rpx;
	}

	.section-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 40rpx 4rpx 22rpx;
	}

	.section-title {
		color: #111827;
		font-size: 34rpx;
		font-weight: 700;
	}

	.more {
		color: #166534;
		font-size: 25rpx;
		font-weight: 600;
	}

	.state-card {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 160rpx;
		border: 1rpx solid #edf0ed;
		border-radius: 22rpx;
		color: #7a8380;
		font-size: 27rpx;
		background: #fff;
		box-shadow: 0 12rpx 32rpx rgba(17, 24, 39, 0.05);
	}

	.task-card {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 18rpx;
		padding: 30rpx 25rpx;
		border: 1rpx solid #edf0ed;
		border-radius: 22rpx;
		background: #fff;
		box-shadow: 0 12rpx 32rpx rgba(17, 24, 39, 0.05);
	}

	.task-main {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
	}

	.task-title {
		color: #111827;
		font-size: 30rpx;
		font-weight: 700;
	}

	.task-detail {
		margin-top: 12rpx;
		color: #6b7280;
		font-size: 24rpx;
		line-height: 1.5;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		margin-top: 16rpx;
	}

	.tag {
		margin: 0 10rpx 10rpx 0;
		padding: 6rpx 14rpx;
		border-radius: 999rpx;
		color: #166534;
		font-size: 21rpx;
		background: #edf7ef;
	}

	.task-side {
		display: flex;
		align-items: flex-end;
		flex-direction: column;
		margin-left: 18rpx;
	}

	.price {
		color: #166534;
		font-size: 30rpx;
		font-weight: 800;
	}

	.accept-button {
		margin: 18rpx 0 0;
		padding: 0 22rpx;
		min-width: 112rpx;
		height: 54rpx;
		line-height: 54rpx;
		border-radius: 14rpx;
		color: #fff;
		font-size: 24rpx;
		background: #166534;
	}
</style>
