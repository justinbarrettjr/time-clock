class LocalStorage {
    constructor() {
        this.obj = null
        this.today = null

        // Set Days in localStorage if not already present
        if(localStorage.getItem('days') == null)
            this.set('days', {})
        
        // Set Global Variable for days object
        this.obj = this.get('days')
    }

    get(item) {
        let value = localStorage.getItem(item)
        if(value.includes('{') || value.includes('['))
            value = JSON.parse(value)
        
        return value
    }

    set(item, value) {
        if(typeof value === 'object')
            value = JSON.stringify(value)

        return localStorage.setItem(item, value)
    }

    update() {
        this.set('days', this.obj)
        console.log(' ')
        console.log(`Storage updated:`)
        console.log(this.obj)
        console.log(' ')
    }
}