const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
let current_month = null
let dark_mode = false

class TimeClock {
    constructor() {
        this.clocked_in = false
        this.time_in = null
        this.time_out = null
        this.button = null
    }

    clock_in(ignore_storage = false) {
        if(this.clocked_in) return 'Already clocked in'

        this.clocked_in = true

        if(!ignore_storage) this.time_in = Date.now()
        else this.time_in = storage.today[storage.today.length-1].in

        if(this.button != null){
            this.button.innerText = 'Clock Out'
            this.button.style.background = '#dd2121'
            clocked_in()
        }
        
        if(!ignore_storage){
            storage.today.push( {in: this.time_in, out: null} )
            storage.update()
        }

        return `Clocked in at: ${parse_time(this.time_in)}`
    }

    clock_out() {
        if(!this.clocked_in) return 'Already clocked out'

        this.clocked_in = false
        this.time_out = Date.now()
        if(this.button != null){
            this.button.innerText = 'Clock In'
            this.button.style.background = '#17b117'
        }

        storage.today[storage.today.length-1].out = this.time_out
        storage.update()

        return `Clocked out at: ${parse_time(this.time_out)}, Time In: ${parse_time_frame(this.time_out - this.time_in)}`
    }
}

class Day{
    constructor(key, value) {
        this.key = key
        this.month = key.split('_')[0]
        this.day = key.split('_')[1]
        this.year = key.split('_')[2]
        this.data = value
        this.div = this.print()
    }
    
    print() {
        if(current_month != this.month){
            let yr = ''
            if(this.year != new Date().getFullYear())
                yr = ' '+this.year
            current_month = this.month
            new_month(MONTHS[this.month]+yr)
        }
        
        let div = document.createElement('fieldset')
        let sub_div = document.createElement('legend')
        sub_div.innerHTML = this.day+'<span></span>'
        div.append(sub_div)
        sub_div = document.createElement('div')
        sub_div.classList.add('space')
        div.append(sub_div)
        document.querySelector('#container').append(div)
        return div
    }
}

let clock = new TimeClock()
let storage = new LocalStorage()
let today_div
let total_time_today = 0
let current_time_clock = null

document.addEventListener("DOMContentLoaded", function(){
    init()
});

function init() {
    resize()
    console.debug('initialized')
    clock.button = document.querySelector('#time_clock_button')
    clock.button.onclick = function() {
        if(clock.clocked_in)
            console.log(clock.clock_out())
        else
            console.log(clock.clock_in())
    }

    // Set object for today if not already present
    if(storage.obj[today()] == null){
        storage.obj[today()] = []
        storage.update()
    }
    storage.today = storage.obj[today()]

    console.debug('Today: '+today())
    console.debug(storage.obj)


    for (const [key, value] of Object.entries(storage.obj)) {
        let day = new Day(key, value)
        if(day.key == today())
            today_div = day.div

        // Show Times Clocked in
        day.data.forEach(time => {
            let time_in = get_total_minutes(new Date(time.in))
        
            let time_out
            if(time.out != null) time_out = get_total_minutes(new Date(time.out))
            else time_out = get_total_minutes(new Date())

            new_div(time, false, day.div)

            total_time_today += time_out - time_in
        })
        
        // Show Hours in today
        total_hours(total_time_today, day.div)

    }

    if(today_div == null){
        let day = new Day(today(), [])
        today_div = day.div
    }

    // Auto Clock In
    let auto_clock_in = false
    if(storage.today.length == 0){}
    else if(storage.today[storage.today.length-1].out == null) auto_clock_in = true
    if(auto_clock_in) clock.clock_in(true)

    // Dark Mode
    if(storage.get('dark_mode'))
        toggle_dark_mode()


}

function resize() {
    document.querySelector('#container').style.height = window.innerHeight - 230 + 'px'
}

function toggle_dark_mode() {
    if(dark_mode != false){
        dark_mode.remove()
        dark_mode = false
        storage.set('dark_mode', false)
    }else{
        let div = document.createElement('link')
        div.rel = 'stylesheet'
        div.href = 'dark_mode.css'
        document.head.append(div)
        dark_mode = div
        storage.set('dark_mode', true)
    }
}

function new_month(month) {
    let div = document.createElement('h1')
    div.innerHTML = `<span>${month}</span>`
    document.querySelector('#container').append(div)
}

function total_hours(total_time, day = null) {
    let suffix = 'hr'
    if(total_time < 60)
        suffix = 'min'
    else
    total_time = Math.floor(total_time / 60 * 10) / 10

    if(day != null)
        day.children[0].children[0].innerText = total_time + ' ' + suffix
    else
        console.error('day = null')
}

function get_total_minutes(time){
    return time.getHours() * 60 + time.getMinutes()
}

function new_div(time, existing_div = false, append = null, clas = 'time_in') {

    let time_in = get_total_minutes(new Date(time.in))
    
    let time_out
    if(time.out != null) time_out = get_total_minutes(new Date(time.out))
    else time_out = get_total_minutes(new Date())

    // Create Div
    if(!existing_div){
        div = document.createElement('div')
        div.classList.add(clas)
    }else
        div = existing_div

    div.style.left = Math.floor((time_in / 1440) * 100) + '%'
    div.style.width = Math.floor(((time_out - time_in) / 1440) * 100) + '%'

    // Write String for time range
    let string_time_in = parse_time(time.in)
    let string_time_out = parse_time(time.out)
    if(time.out == null)
        string_time_out = 'now'

    div.innerText = `${string_time_in} - ${string_time_out}`
    div.title = div.innerText

    // Append Div
    if(append != null)
        append.children[1].append(div)

    return div
}

function clocked_in() {
    clock.button.innerText = parse_time_frame(Date.now() - clock.time_in)

    let time_in = new Date(clock.time_in)
    let time_out = new Date()

    if(current_time_clock == null)
    current_time_clock = new_div({in: time_in, out: time_out}, false, today_div)
    else
        new_div({in: time_in, out: time_out}, current_time_clock, today_div)

    total_hours(total_time_today + (get_total_minutes(time_out) - get_total_minutes(time_in)), today_div)

    if(clock.clocked_in) setTimeout(clocked_in, 1000)
    else{ 
        clock.button.innerText = 'Clock In'
        div = null
    }
}

function parse_time(time) {
    let date = new Date(time)
    let hh = date.getHours()
    let mm = date.getMinutes()
    if(mm < 10)
        mm = `0${mm}`

    return `${hh}:${mm}`
}

function parse_time_frame(time) {
    let ss = time / 1000
    let mm = ss / 60
    let hh = mm / 60

    ss = Math.floor(ss)%60
    if(ss < 10) ss = `0${ss}`
    
    mm = Math.floor(mm)%60
    if(mm < 10) mm = `0${mm}`
    hh = Math.floor(hh)
    if(hh < 10) hh = `0${hh}`

    return `${hh}:${mm}:${ss}`
}

function today() {
    let d = new Date()
    return `${d.getMonth()}_${d.getDate()}_${d.getFullYear()}`
}