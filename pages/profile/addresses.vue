<template>
	<view class="page">
		<view v-for="(item, index) in addresses" :key="item.id" class="address">
			<view class="title"><text>{{ item.name }}</text><text v-if="item.isDefault" class="tag">默认</text></view>
			<text class="line">{{ item.region.join('') }}{{ item.detail }}</text>
			<text class="line">{{ item.contact }}  {{ item.phone }}</text>
			<view class="actions">
				<text v-if="!item.isDefault" @click="setDefault(index)">设为默认</text>
				<text @click="edit(index)">编辑</text>
				<text class="delete" @click="remove(index)">删除</text>
			</view>
		</view>
		<view v-if="!addresses.length && !editing" class="empty">暂无服务地址，请添加常用作业地点。</view>
		<view v-if="editing" class="editor">
			<text class="editor-title">{{ editIndex < 0 ? '新增服务地址' : '编辑服务地址' }}</text>
			<input v-model="form.name" placeholder="地址名称，如：东侧水稻田" />
			<picker mode="region" :value="form.region" @change="form.region = $event.detail.value">
				<view class="picker">{{ form.region.length ? form.region.join(' / ') : '请选择所在地区' }}</view>
			</picker>
			<input v-model="form.detail" placeholder="详细地点或地块描述" />
			<input v-model="form.contact" placeholder="联系人" />
			<input v-model="form.phone" type="number" maxlength="11" placeholder="联系电话" />
			<view class="switch"><text>设为默认地址</text><switch :checked="form.isDefault" color="#237a4d" @change="form.isDefault = $event.detail.value" /></view>
			<view class="buttons"><button class="cancel" @click="editing = false">取消</button><button class="save" @click="save">保存</button></view>
		</view>
		<button v-if="!editing" class="add" @click="add">新增服务地址</button>
	</view>
</template>

<script>
	import request from '../../utils/request.js'

	const empty = () => ({ id: '', name: '', region: [], detail: '', contact: '', phone: '', isDefault: false })
	export default {
		data() { return { addresses: [], editing: false, editIndex: -1, form: empty() } },
		onShow() { this.loadAddresses() },
		methods: {
			getData(response) {
				return response && response.data !== undefined ? response.data : response
			},
			loadAddresses() {
				request({
					url: '/api/address/list',
					method: 'GET'
				}).then((response) => {
					const data = this.getData(response)
					this.addresses = Array.isArray(data) ? data.map(item => ({
						...item,
						region: Array.isArray(item.region) ? item.region : (item.region ? [item.region] : [])
					})) : []
					this.persist()
				}).catch(() => {})
			},
			add() { this.editIndex = -1; this.form = empty(); this.form.isDefault = !this.addresses.length; this.editing = true },
			edit(index) { this.editIndex = index; this.form = { ...this.addresses[index], region: [...this.addresses[index].region] }; this.editing = true },
			save() {
				if (!this.form.name.trim() || !this.form.region.length || !this.form.detail.trim()) return uni.showToast({ title: '请完善地址信息', icon: 'none' })
				if (!this.form.contact.trim() || !/^1\d{10}$/.test(this.form.phone)) return uni.showToast({ title: '请填写有效电话', icon: 'none' })
				const value = {
					name: this.form.name.trim(),
					region: this.form.region,
					detail: this.form.detail.trim(),
					contact: this.form.contact.trim(),
					phone: this.form.phone,
					isDefault: this.form.isDefault
				}
				const editingId = this.editIndex < 0 ? '' : this.addresses[this.editIndex].id
				request({
					url: editingId ? `/api/address/update/${editingId}` : '/api/address/create',
					method: editingId ? 'PUT' : 'POST',
					data: value
				}).then(() => {
					this.editing = false
					this.loadAddresses()
					uni.showToast({ title: '地址已保存', icon: 'success' })
				}).catch(() => {})
			},
			setDefault(index) {
				request({
					url: `/api/address/default/${this.addresses[index].id}`,
					method: 'POST'
				}).then(() => {
					this.loadAddresses()
					uni.showToast({ title: '默认地址已更新', icon: 'none' })
				}).catch(() => {})
			},
			remove(index) {
				uni.showModal({ title: '删除地址', content: '确定删除此服务地址吗？', success: result => {
					if (!result.confirm) return
					request({
						url: `/api/address/delete/${this.addresses[index].id}`,
						method: 'DELETE'
					}).then(() => {
						this.loadAddresses()
						uni.showToast({ title: '地址已删除', icon: 'none' })
					}).catch(() => {})
				} })
			},
			persist() {
				uni.setStorageSync('addressList', this.addresses)
				uni.setStorageSync('planeServiceAddresses', this.addresses)
			}
		}
	}
</script>

<style scoped>
	.page { box-sizing: border-box; min-height: 100vh; padding: 28rpx; background: #f5f7f2; }
	.address, .editor, .empty { margin-bottom: 20rpx; padding: 28rpx; border-radius: 22rpx; background: #fff; }
	.title { display: flex; align-items: center; margin-bottom: 12rpx; color: #192920; font-size: 31rpx; font-weight: 600; }
	.tag { margin-left: 14rpx; padding: 3rpx 12rpx; border-radius: 18rpx; color: #237a4d; font-size: 21rpx; background: #e8f4ea; }
	.line { display: block; color: #69776e; font-size: 25rpx; line-height: 40rpx; }
	.actions { display: flex; justify-content: flex-end; margin-top: 20rpx; padding-top: 18rpx; border-top: 1rpx solid #edf1ea; color: #237a4d; font-size: 25rpx; }
	.actions text { margin-left: 32rpx; } .actions .delete { color: #b55d50; }
	.empty { color: #77857b; font-size: 27rpx; text-align: center; }
	.editor-title { display: block; margin-bottom: 18rpx; color: #18261f; font-size: 32rpx; font-weight: 600; }
	.editor input, .picker { box-sizing: border-box; height: 84rpx; margin-top: 16rpx; padding: 0 20rpx; border-radius: 13rpx; color: #18261f; font-size: 27rpx; background: #f5f8f4; }
	.picker { display: flex; align-items: center; color: #66766d; }
	.switch { display: flex; align-items: center; justify-content: space-between; margin-top: 24rpx; color: #27382f; font-size: 27rpx; }
	.buttons { display: flex; margin-top: 28rpx; } .buttons button { flex: 1; height: 86rpx; border-radius: 16rpx; font-size: 28rpx; }
	.cancel { margin-right: 18rpx; color: #237a4d; background: #edf6ef; } .save, .add { color: #fff; background: #237a4d; }
	.buttons button::after, .add::after { border: none; }
	.add { width: 100%; height: 88rpx; margin-top: 24rpx; border-radius: 16rpx; font-size: 28rpx; }
</style>
