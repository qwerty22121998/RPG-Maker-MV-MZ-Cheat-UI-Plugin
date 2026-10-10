import {TRANSLATE_SETTINGS, TRANSLATOR} from '../js/TranslateHelper.js'
import PinMixin from '../js/PinMixin.js'

export default {
    name: 'VariableSettingPanel',

    mixins: [PinMixin],

    template: `
<v-card flat class="ma-0 pa-0">
    <v-data-table
        v-if="tableHeaders"
        denses
        :headers="tableHeaders"
        :items="filteredTableItems"
        :search="search"
        :custom-filter="tableItemFilter"
        :custom-sort="sortPinnedFirst"
        :items-per-page="5">
        <template v-slot:top>
            <v-text-field
                label="Search..."
                solo
                background-color="grey darken-3"
                v-model="search"
                dense
                hide-details
                @keydown.self.stop
                @focus="$event.target.select()">
            </v-text-field>
            <v-row
                class="ma-0 pa-0">
                <v-col
                    cols="12"
                    md="12">
                    <v-checkbox
                        v-model="excludeNameless"
                        dense
                        hide-details
                        label="Hide Nameless Items">
                    
                    </v-checkbox>
                </v-col>
            </v-row>
        </template>
        <template
            v-slot:item.pin="{ item }">
            <v-icon small @click="togglePin(item)">{{ pins[item.id] ? 'mdi-pin' : 'mdi-pin-outline' }}</v-icon>
        </template>
        <template
            v-slot:item.value="{ item }">
            <v-text-field
                background-color="grey darken-3"
                class="d-inline-flex"
                height="10"
                style="width: 60px;"
                hide-details
                solo
                :value="item.value"
                label="Value"
                dense
                @keydown.self.stop
                @change="onItemChange(item, $event)"
                @focus="$event.target.select()">
            </v-text-field>
        </template>
    </v-data-table>
    
    <v-tooltip
        bottom>
        <span>Reload from game data</span>
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                style="top: 0px; right: 0px;"
                color="pink"
                dark
                small
                absolute
                top
                right
                fab
                v-bind="attrs"
                v-on="on"
                @click="initializeVariables">
                <v-icon>mdi-refresh</v-icon>
            </v-btn>
        </template>
    </v-tooltip>
</v-card>
    `,

    data () {
        return {
            search: '',
            excludeNameless: false,
            pinKey: 'cheat.pins.variables',

            variableNames: [],

            tableHeaders: [
                {
                    text: 'Pin',
                    value: 'pin',
                    sortable: false
                },
                {
                    text: 'Name',
                    value: 'name'
                },
                {
                    text: 'Value',
                    value: 'value'
                }
            ],
            tableItems: []
        }
    },

    created () {
        this.initializeVariables()
    },

    computed: {
        filteredTableItems () {
            return this.tableItems.filter(item => {
                if (this.pins[item.id]) {
                    return true
                }

                if (this.excludeNameless && !item.name) {
                    return false
                }

                return true
            })
        }
    },

    methods: {
        async initializeVariables () {
            this.variableNames = await this.getVariableNames()

            this.tableItems = this.variableNames.map((varName, idx) => {
                return {
                    id: idx,
                    name: varName,
                    value: $gameVariables.value(idx)
                }
            })
        },

        async getVariableNames () {
            const rawVariableNames = $dataSystem.variables.slice()

            if (TRANSLATE_SETTINGS.isVariableTranslateEnabled()) {
                return await TRANSLATOR.translateBulk(rawVariableNames)
            }

            return rawVariableNames
        },

        onItemChange (item, input) {
            // modify value (the text field gives a string: keep numbers as numbers, or the game's "+ 1" appends a digit)
            const number = Number(input)
            $gameVariables.setValue(item.id, isNaN(number) ? input : number)

            // refresh (in two steps, so the field is redrawn even if the game kept the old value)
            item.value = input
            this.$nextTick(() => {
                item.value = $gameVariables.value(item.id)
            })
        },

        tableItemFilter (value, search, item) {
            if (this.pins[item.id] || search === null || search.trim() === '') {
                return true
            }

            search = search.toLowerCase()

            return item.name.toLowerCase().contains(search) || String(item.value).toLowerCase().contains(search)
        }
    }
}
