"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const empty = () => ({ id: "", name: "", region: [], detail: "", contact: "", phone: "", isDefault: false });
const _sfc_main = {
  data() {
    return { addresses: [], editing: false, editIndex: -1, form: empty() };
  },
  onShow() {
    this.loadAddresses();
  },
  methods: {
    getData(response) {
      return response && response.data !== void 0 ? response.data : response;
    },
    loadAddresses() {
      utils_request.request({
        url: "/api/address/list",
        method: "GET"
      }).then((response) => {
        const data = this.getData(response);
        this.addresses = Array.isArray(data) ? data.map((item) => ({
          ...item,
          region: Array.isArray(item.region) ? item.region : item.region ? [item.region] : []
        })) : [];
        this.persist();
      }).catch(() => {
      });
    },
    add() {
      this.editIndex = -1;
      this.form = empty();
      this.form.isDefault = !this.addresses.length;
      this.editing = true;
    },
    edit(index) {
      this.editIndex = index;
      this.form = { ...this.addresses[index], region: [...this.addresses[index].region] };
      this.editing = true;
    },
    save() {
      if (!this.form.name.trim() || !this.form.region.length || !this.form.detail.trim())
        return common_vendor.index.showToast({ title: "请完善地址信息", icon: "none" });
      if (!this.form.contact.trim() || !/^1\d{10}$/.test(this.form.phone))
        return common_vendor.index.showToast({ title: "请填写有效电话", icon: "none" });
      const value = {
        name: this.form.name.trim(),
        region: this.form.region,
        detail: this.form.detail.trim(),
        contact: this.form.contact.trim(),
        phone: this.form.phone,
        isDefault: this.form.isDefault
      };
      const editingId = this.editIndex < 0 ? "" : this.addresses[this.editIndex].id;
      utils_request.request({
        url: editingId ? `/api/address/update/${editingId}` : "/api/address/create",
        method: editingId ? "PUT" : "POST",
        data: value
      }).then(() => {
        this.editing = false;
        this.loadAddresses();
        common_vendor.index.showToast({ title: "地址已保存", icon: "success" });
      }).catch(() => {
      });
    },
    setDefault(index) {
      utils_request.request({
        url: `/api/address/default/${this.addresses[index].id}`,
        method: "POST"
      }).then(() => {
        this.loadAddresses();
        common_vendor.index.showToast({ title: "默认地址已更新", icon: "none" });
      }).catch(() => {
      });
    },
    remove(index) {
      common_vendor.index.showModal({ title: "删除地址", content: "确定删除此服务地址吗？", success: (result) => {
        if (!result.confirm)
          return;
        utils_request.request({
          url: `/api/address/delete/${this.addresses[index].id}`,
          method: "DELETE"
        }).then(() => {
          this.loadAddresses();
          common_vendor.index.showToast({ title: "地址已删除", icon: "none" });
        }).catch(() => {
        });
      } });
    },
    persist() {
      common_vendor.index.setStorageSync("addressList", this.addresses);
      common_vendor.index.setStorageSync("planeServiceAddresses", this.addresses);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.addresses, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.name),
        b: item.isDefault
      }, item.isDefault ? {} : {}, {
        c: common_vendor.t(item.region.join("")),
        d: common_vendor.t(item.detail),
        e: common_vendor.t(item.contact),
        f: common_vendor.t(item.phone),
        g: !item.isDefault
      }, !item.isDefault ? {
        h: common_vendor.o(($event) => $options.setDefault(index), item.id)
      } : {}, {
        i: common_vendor.o(($event) => $options.edit(index), item.id),
        j: common_vendor.o(($event) => $options.remove(index), item.id),
        k: item.id
      });
    }),
    b: !$data.addresses.length && !$data.editing
  }, !$data.addresses.length && !$data.editing ? {} : {}, {
    c: $data.editing
  }, $data.editing ? {
    d: common_vendor.t($data.editIndex < 0 ? "新增服务地址" : "编辑服务地址"),
    e: $data.form.name,
    f: common_vendor.o(($event) => $data.form.name = $event.detail.value, "d8"),
    g: common_vendor.t($data.form.region.length ? $data.form.region.join(" / ") : "请选择所在地区"),
    h: $data.form.region,
    i: common_vendor.o(($event) => $data.form.region = $event.detail.value, "85"),
    j: $data.form.detail,
    k: common_vendor.o(($event) => $data.form.detail = $event.detail.value, "f4"),
    l: $data.form.contact,
    m: common_vendor.o(($event) => $data.form.contact = $event.detail.value, "23"),
    n: $data.form.phone,
    o: common_vendor.o(($event) => $data.form.phone = $event.detail.value, "c6"),
    p: $data.form.isDefault,
    q: common_vendor.o(($event) => $data.form.isDefault = $event.detail.value, "d8"),
    r: common_vendor.o(($event) => $data.editing = false, "a5"),
    s: common_vendor.o((...args) => $options.save && $options.save(...args), "64")
  } : {}, {
    t: !$data.editing
  }, !$data.editing ? {
    v: common_vendor.o((...args) => $options.add && $options.add(...args), "53")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9db9159f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/addresses.js.map
