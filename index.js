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
        this.time_in = Date.now()
        if(this.button != null){
            this.button.innerText = 'Clock Out'
            this.button.style.background = '#dd2121'
            clocked_in()
        }
        
        if(!ignore_storage){
            storage.today.push( {in: this.time_in, out: null} )
            storage.update()
        }else{
            this.time_in = storage.today[storage.today.length-1].in
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


let clock = new TimeClock()
let storage = new LocalStorage()
let div

document.addEventListener("DOMContentLoaded", function(){
    init()
});

function init() {
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

    console.log('Today: '+today())

    // Show Times Clocked in
    let total_time_today = 0
    storage.today.forEach(time => {
        let time_in = new Date(time.in)
        time_in = time_in.getHours() * 60 + time_in.getMinutes()

        let time_out
        if(time.out != null)
            time_out = new Date(time.out)
        else
            time_out = new Date()
        
        time_out = time_out.getHours() * 60 + time_out.getMinutes()

        div = document.createElement('div')
        div.classList.add('schedule')
        div.style.left = Math.floor((time_in / 1440) * 100) + '%'
        div.style.width = Math.floor(((time_out - time_in) / 1440) * 100) + '%'

        let string_time_in = parse_time(time.in)
        let string_time_out = parse_time(time.out)
        if(time.out == null)
            string_time_out = 'now'

        div.innerText = `${string_time_in} - ${string_time_out}`
        div.title = div.innerText
        document.querySelector('#today').children[1].append(div)

        total_time_today += time_out - time_in
    })
    
    let suffix = 'hr'
    if(total_time_today < 60)
        suffix = 'min'
    else
        total_time_today = Math.floor(total_time_today / 60 * 10) / 10

    document.querySelector('#today').children[0].children[0].innerText = total_time_today + ' ' + suffix

    // Auto Clock In
    let auto_clock_in = false
    if(storage.today.length == 0){}
    else if(storage.today[storage.today.length-1].out == null) auto_clock_in = true
    if(auto_clock_in) clock.clock_in(true)

    // Testing

    var start = new Date();
    start.setDate(19)
    start.setHours(0,0,0,0);

    var end = new Date();
    end.setDate(19)
    end.setHours(23,59,59,999);

    // alert( start.toUTCString() + ':' + end.toUTCString() );

}


function clocked_in() {
    clock.button.innerText = parse_time_frame(Date.now() - clock.time_in)


    let time_in = new Date(clock.time_in)
    time_in = time_in.getHours() * 60 + time_in.getMinutes()

    let time_out = new Date()
    time_out = time_out.getHours() * 60 + time_out.getMinutes()

    div.style.width = Math.floor(((time_out - time_in) / 1440) * 100) + '%'

    if(clock.clocked_in) setTimeout(clocked_in, 1000)
    else clock.button.innerText = 'Clock In'
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

    ss = Math.floor(ss)
    if(ss < 10) ss = `0${ss}`
    mm = Math.floor(mm)
    if(mm < 10) mm = `0${mm}`
    hh = Math.floor(hh)
    if(hh < 10) hh = `0${hh}`

    return `${hh}:${mm}:${ss}`
}

function today() {
    let d = new Date()
    return `${d.getMonth()}_${d.getDate()}_${d.getFullYear()}`
}