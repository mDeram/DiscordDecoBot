module.exports =  {
    hour_to_milli: function(h) { return h*3600000; },

    min_to_sec: function(m) { return m*60; },
    min_to_milli: function(m) { return m*60000; },

    sec_to_milli: function(s) { return s*1000; },
    sec_to_min: function(s) { return s/60; },

    milli_to_sec: function(mi) { return mi/1000; },
    milli_to_min: function(mi) { return mi/60000; }
}
