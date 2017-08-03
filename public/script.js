const PRICE = 9.99;
const LOAD_NUM = 10;

new Vue({
    el: '#app',
    data: {
        total: 0,
        items: [],
        cart: [],
        new_search: "anime",
        last_search: "",
        loading: false,
        price: PRICE,
        results: [],
    },
    // computed properties: Vue will monitor all of the variables used in a computed property,
    // and recalcuate the property if any of those variables change.
    computed: {
        noMoreItems: function() {
            return this.items.length === this.results.length && this.results.length > 0;
        },
    },
    methods: {
        appendItems: function() {
            if (this.items.length < this.results.length) {
                var append = this.results.slice(this.items.length, this.items.length + LOAD_NUM);
                this.items = this.items.concat(append);
            }
        },
        onSubmit: function() {
            if (this.new_search.length) {
                this.items = [];
                this.loading = true;
                this.$http.get('/search/'.concat(this.new_search))
                .then(function(res) {
                    this.last_search = this.new_search;
                    this.results = res.data;
                    this.appendItems();
                    this.loading = false;
                });
            };
        },
        addItem: function(index) {
            this.total += PRICE;
            var item = this.items[index];
            var found = false;
            for (var i=0; i < this.cart.length; i++) {
                if (this.cart[i].id === item.id) {
                    found = true;
                    this.cart[i].qty++;
                    break;
                }
            }
            if (!found) {
                this.cart.push({
                    id: item.id,
                    title: item.title,
                    qty: 1,
                    price: PRICE,
                });
            }
        },
        inc: function(item) {
            item.qty++;
            this.total += PRICE;
        },
        dec: function(item) {
            item.qty--;
            this.total -= PRICE;
            if (item.qty <= 0) {
                for (var i=0; i < this.cart.length; i++) {
                    if (this.cart[i].id === item.id) {
                        this.cart.splice(i, 1);
                        break;
                    }
                }
            }
        },
    },
    filters: {
        currency: function(price) {
            return '$'.concat(price.toFixed(2));
        }
    },
    // Fire the search for the mounted event to populate our page on load.
    mounted: function() {
        this.onSubmit();
        var vueInstance = this;  // Hack to get access to the Vue instance in the watcher instance.
        // Set up our watcher instance.
        var elem = document.getElementById("product-list-bottom");
        var watcher = scrollMonitor.create(elem);
        watcher.enterViewport(function() {
            vueInstance.appendItems();
        });
    },
});
