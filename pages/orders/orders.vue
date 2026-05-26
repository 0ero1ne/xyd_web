<template>
	<view class="page">
		<view class="status-tabs">
			<text
				v-for="tab in tabs"
				:key="tab"
				class="status-tab"
				:class="{ active: activeTab === tab }"
				@click="activeTab = tab"
			>{{ tab }}</text>
		</view>

		<view v-for="order in filteredOrders" :key="order.id" class="order-card">
			<view class="order-top">
				<text class="order-number">{{ order.id }}</text>
				<text class="status">{{ order.status }}</text>
			</view>
			<text class="crop">{{ order.crop }}</text>
			<text class="meta">{{ order.address }} · {{ order.area }}</text>
			<view class="order-bottom">
				<text class="date">{{ order.date }}</text>
				<text class="amount">{{ order.amount }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				activeTab: '全部',
				tabs: ['全部', '进行中', '已完成'],
				orders: [
					{
						id: '订单 2026052501',
						status: '进行中',
						crop: '水稻病虫防治',
						address: '青禾村东侧 3 号田',
						area: '32 亩',
						date: '05-25 09:30',
						amount: '¥960'
					},
					{
						id: '订单 2026051803',
						status: '已完成',
						crop: '玉米叶面肥喷洒',
						address: '青禾村示范田',
						area: '18 亩',
						date: '05-18 15:00',
						amount: '¥540'
					}
				]
			}
		},
		computed: {
			filteredOrders() {
				if (this.activeTab === '全部') {
					return this.orders
				}
				return this.orders.filter(order => order.status === this.activeTab)
			}
		}
	}
</script>

<style scoped>
	.page {
		box-sizing: border-box;
		min-height: 100vh;
		padding: 24rpx 28rpx 48rpx;
		background: #f5f7f2;
	}

	.status-tabs {
		display: flex;
		padding: 8rpx;
		margin-bottom: 28rpx;
		border-radius: 18rpx;
		background: #fff;
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
		color: #237a4d;
		font-weight: 600;
		background: #edf6ef;
	}

	.order-card {
		display: flex;
		flex-direction: column;
		margin-bottom: 20rpx;
		padding: 28rpx;
		border-radius: 22rpx;
		background: #fff;
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
		color: #237a4d;
		font-size: 23rpx;
		background: #e8f4ea;
	}

	.crop {
		margin-top: 27rpx;
		color: #1c2d24;
		font-size: 31rpx;
		font-weight: 600;
	}

	.meta {
		margin: 12rpx 0 30rpx;
		color: #748278;
		font-size: 25rpx;
	}

	.order-bottom {
		padding-top: 22rpx;
		border-top: 1rpx solid #eff2ec;
	}

	.amount {
		color: #18271f;
		font-size: 29rpx;
		font-weight: 600;
	}
</style>
