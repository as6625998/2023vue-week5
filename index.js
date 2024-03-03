
// 定義驗證規則，驗證失敗時才會跳出提示文字
Object.keys(VeeValidateRules).forEach(rule => {
  if (rule !== 'default') {
      VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});

// 設定語言環境
// 使用 VeeValidateI18n.loadLocaleFromURL 語法載入繁體中文的 CDN
// 只要將末端的 ar.json 改為 zh_TW.json 即可，這段意思是語言代碼
// 再使用 VeeValidate.configure 將回饋訊息的語言設定為繁體中文，並在輸入內容就即時驗證
VeeValidateI18n.loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.12.4/dist/locale/zh_TW.json');

VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});


const userModal = {
  props: ['tempProduct','addCart'],
  data(){
    return{
      productModal : null,
      qty: 1
    }
  },
  methods:{
    open(){
      this.productModal.show()
    },
    close(){
      this.productModal.hide()
    }
  },
  watch:{
    tempProduct(){
      this.qty = 1
    }
  },
  template: '#userProductModal',

  mounted(){
    this.productModal = new bootstrap.Modal(this.$refs.modal)
  }
}
const app = Vue.createApp({
  data(){
    return{
      products:[],
      tempProduct:{},
      status:{
        addCartLoading:'',
        cartQtyLoading:''
      },
      form: {
        user: {
          name: "",
          email: "",
          tel: "",
          address: "",
        },
        message: "",
      },
      carts:{}
    }
  },
  methods:{
    getProducts(){
      axios.get(`${apiUrl}/v2/api/${apiPath}/products/all`)
      .then(res => {
        this.products = res.data.products
      })
    },
    openModal(product){
      this.tempProduct = product
      this.$refs.userModal.open()
    },
    addCart(product_id, qty=1){
      const order = {
        product_id,
        qty
      }
      this.status.addCartLoading = product_id
      axios.post(`${apiUrl}/v2/api/${apiPath}/cart`, {data:order})
      .then(res => {
        this.status.addCartLoading = ""
        this.getCart()
        this.$refs.userModal.close()
      })
    },
    changeCartQty(item, qty=1){
      const order = {
        product_id: item.product_id,
        qty
      }
      this.status.cartQtyLoading = item.id
      axios.put(`${apiUrl}/v2/api/${apiPath}/cart/${item.id}`, {data:order})
      .then(res => {
        this.status.cartQtyLoading = ""
        this.getCart()
      })
    },
    removeCartItem(id){
      this.status.cartQtyLoading = id
      axios.delete(`${apiUrl}/v2/api/${apiPath}/cart/${id}`)
      .then(res => {
        this.status.cartQtyLoading = ""
        this.getCart()
      })
    },
    removeAllCartItem(){
      axios.delete(`${apiUrl}/v2/api/${apiPath}/carts`)
      .then(res => {
        this.getCart()
      })
    },
    getCart(){
      axios.get(`${apiUrl}/v2/api/${apiPath}/cart`)
      .then(res => {
        console.log(res)
        this.carts = res.data.data
      })
    },
    createOrder() {
      const order = this.form;  // this.form => 往外找，取到 data.return.form
      axios.post(`${apiUrl}/api/${apiPath}/order`, { data: order })
      .then(res => {
        this.$refs.form.resetForm();  // 成功送出後使清除表單欄位的內容
        this.form.message = ""; // 成功送出後，清空留言
        this.getCart();
      })
      }
  },
  components:{
    userModal
  },
  mounted() {
    this.getProducts()
    this.getCart()
  },
})
app.component('VForm', VeeValidate.Form);  // 對應到 HTML 中原本的 form 標籤
app.component('VField', VeeValidate.Field);  // 對應到 input 標籤
app.component('ErrorMessage', VeeValidate.ErrorMessage);  // 驗證失敗時會顯示的提示訊息
app.mount('#app')