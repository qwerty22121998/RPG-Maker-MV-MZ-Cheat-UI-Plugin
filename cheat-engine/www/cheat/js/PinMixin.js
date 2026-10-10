import {KEY_VALUE_STORAGE} from './KeyValueStorage.js'

// Pinned table rows are listed first and are never hidden by search or filters.
// The host component provides `pinKey` (storage key) and rows with a unique `id`.
export default {
    data () {
        return {
            pins: {}
        }
    },

    created () {
        this.pins = JSON.parse(KEY_VALUE_STORAGE.getItem(this.pinKey) || '{}')
    },

    methods: {
        togglePin (item) {
            if (this.pins[item.id]) {
                this.$delete(this.pins, item.id)
            } else {
                this.$set(this.pins, item.id, true)
            }

            KEY_VALUE_STORAGE.setItem(this.pinKey, JSON.stringify(this.pins))
        },

        // for <v-data-table :custom-sort>: vuetify's own sort, then pinned rows moved to the top
        sortPinnedFirst (items, ...sortArgs) {
            const sorted = Vue.component('VDataTable').options.props.customSort.default(items, ...sortArgs)

            return [...sorted.filter(item => this.pins[item.id]), ...sorted.filter(item => !this.pins[item.id])]
        }
    }
}
