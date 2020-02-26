const vm = new Vue({
    el: '#app',
    data: {
        data: []
    },
    mounted: function() {
        axios({
                "method": "GET",
                "url": "https://euw1.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5?api_key=RGAPI-bc60ac66-5742-4f11-8f80-2de8a273d3f6",
                "Origin": "https://developer.riotgames.com",
                "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Riot-Token": "RGAPI-bc60ac66-5742-4f11-8f80-2de8a273d3f6",
                "Accept-Language": "es-ES,es;q=0.9",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36"

            }).then((res) => {
                this.data = res.data.entries;
                this.data.sort(function(b, a) {
                    if (a.leaguePoints > b.leaguePoints) {
                        return 1;
                    }
                    if (a.leaguePoints < b.leaguePoints) {
                        return -1;
                    }
                    // a must be equal to b
                    return 0;
                })
                this.data = this.data.slice(0, 50)
            })
            .catch((error) => {
                console.log(error)
            })

    }

});