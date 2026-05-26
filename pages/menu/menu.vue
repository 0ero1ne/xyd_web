<template>
	<view class="page">
		<view class="welcome-card">
			<text class="eyebrow">{{ roleName }}服务台</text>
			<text class="headline">{{ greeting }}</text>
			<text class="caption">{{ caption }}</text>
			<button class="action-button" @click="handleAction">{{ actionText }}</button>
		</view>

		<view class="section-heading">
			<text class="section-title">{{ listTitle }}</text>
			<text class="more">查看全部</text>
		</view>
		<view v-for="item in items" :key="item.title" class="task-card">
			<view class="task-main">
				<text class="task-title">{{ item.title }}</text>
				<text class="task-detail">{{ item.detail }}</text>
			</view>
			<text class="price">{{ item.price }}</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				role: 'farmer'
			}
		},
		computed: {
			isFarmer() {
				return this.role === 'farmer'
			},
			roleName() {
				return this.isFarmer ? '农户' : '飞手'
			},
			greeting() {
				return this.isFarmer ? '今天需要植保服务吗？' : '发现附近待接任务'
			},
			caption() {
				return this.isFarmer ? '一键发布地块作业，专业飞手快速响应' : '确认作物和面积，选择适合您的航线'
			},
			actionText() {
				return this.isFarmer ? '发布作业订单' : '查看可接订单'
			},
			listTitle() {
				return this.isFarmer ? '近期服务' : '推荐任务'
			},
			items() {
				return this.isFarmer
					? [
						{ title: '水稻病虫防治', detail: '东侧 3 号田 · 32 亩', price: '待报价' },
						{ title: '玉米叶面肥喷洒', detail: '河边示范田 · 18 亩', price: '已完成' }
					]
					: [
						{ title: '水稻除虫喷洒', detail: '距您 2.3km · 32 亩', price: '¥960' },
						{ title: '果园营养液喷施', detail: '距您 4.8km · 15 亩', price: '¥600' }
					]
			}
		},
		onShow() {
			this.role = uni.getStorageSync('planeUserRole') || 'farmer'
		},
		methods: {
			handleAction() {
				if (uni.getStorageSync('token')) {
					uni.showToast({
						title: '功能开发中',
						icon: 'none'
					})
					return
				}

				uni.showModal({
					title: '登录后使用服务',
					content: '您可以继续浏览服务内容，发布或承接订单时再登录。',
					cancelText: '继续浏览',
					confirmText: '去登录',
					success: (result) => {
						if (result.confirm) {
							uni.navigateTo({
								url: '/pages/index/index'
							})
						}
					}
				})
			}
		}
	}
</script>

<style scoped>
	.page {
		min-height: 100vh;
		box-sizing: border-box;
		padding: 28rpx 28rpx 50rpx;
		background: #f5f7f2;
	}

	.welcome-card {
		display: flex;
		flex-direction: column;
		padding: 38rpx 32rpx;
		border-radius: 28rpx;
		background: #237a4d;
	}

	.eyebrow {
		color: rgba(255, 255, 255, 0.75);
		font-size: 25rpx;
	}

	.headline {
		margin-top: 18rpx;
		color: #fff;
		font-size: 40rpx;
		font-weight: 600;
	}

	.caption {
		margin: 12rpx 0 34rpx;
		color: rgba(255, 255, 255, 0.78);
		font-size: 25rpx;
	}

	.action-button {
		margin: 0;
		height: 78rpx;
		border-radius: 14rpx;
		color: #237a4d;
		font-size: 28rpx;
		background: #fff;
	}

	.action-button::after {
		border: none;
	}

	.section-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 40rpx 4rpx 22rpx;
	}

	.section-title {
		color: #18261f;
		font-size: 34rpx;
		font-weight: 600;
	}

	.more {
		color: #237a4d;
		font-size: 25rpx;
	}

	.task-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 18rpx;
		padding: 30rpx 25rpx;
		border-radius: 20rpx;
		background: #fff;
	}

	.task-main {
		display: flex;
		flex-direction: column;
	}

	.task-title {
		color: #1f3127;
		font-size: 29rpx;
		font-weight: 600;
	}

	.task-detail {
		margin-top: 12rpx;
		color: #77857b;
		font-size: 24rpx;
	}

	.price {
		color: #237a4d;
		font-size: 27rpx;
		font-weight: 600;
	}
</style>
