(async () => {
        if (document.domain.match(/^109\./) === null) {
            return alert('Запустите скрипт на любом из IP-адресов серверов Тюряги')
        }
        try {
            const offerId = 25, xml = new DOMParser(), timeout = 600,
                addFakes = () => prompt('Вставь сюда фейки. Каждый с новой строки!', ''),
                addRows = () => prompt('Введи через запятую номера вкладок барыги для покупки. От 1 до 5.'),
                existRows = ['bossBattle', 'moscow', 'chemLab', 'resources', 'escape'],
                modes = ['Пац.', 'Блат', 'Авто.'],
                strEnds = (n, str) => {
                    if (n % 10 === 1 && n % 100 !== 11) {
                        return str[0]
                    } else if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) {
                        return str[1]
                    }
                    return str[2]
                },
                logRewards = rewards => {
                    let arr = []
                    for (const reward of rewards) {
                        switch (reward.type) {
                            case 'escapeResource':
                                switch (reward.resourceId) {
                                    case 1:
                                        arr.push(reward.value + ' ' + strEnds(reward.value, ["тайник", "тайника", "тайников"]))
                                        break;
                                    case 2:
                                        arr.push(reward.value + ' ' + strEnds(reward.value, ["заначка", "заначки", "заначек"]))
                                        break;
                                    case 3:
                                        arr.push(reward.value + ' ' + strEnds(reward.value, ["таблетка", "таблетки", "таблеток"]))
                                        break;
                                    case 4:
                                        arr.push(reward.value + ' ' + strEnds(reward.value, ["бутер", "бутера", "бутеров"]))
                                        break
                                }
                                break
                            case 'epicChestKey':
                                if (modes[reward.keyId - 1]) {
                                    arr.push([reward.value, modes[reward.keyId - 1], strEnds(reward.value, ['ключ', 'ключа', 'ключей'])].join(' '))
                                }
                                break
                            case 'rubles':
                                arr.push(reward.value + ' ' + strEnds(reward.value, ["рубль", "рубля", "рублей"]))
                                break
                            case 'toiletpaper':
                                arr.push(reward.value + ' ' + 'туал.')
                                break
                            case 'knife':
                                arr.push(reward.value + ' ' + strEnds(reward.value, ["финка", "финки", "финок"]))
                                break
                            case 'poison':
                                arr.push(reward.value + ' ' + strEnds(reward.value, ["яд", "яда", "ядов"]))
                                break
                            case 'gun':
                                arr.push(reward.value + ' ' + strEnds(reward.value, ["самопал", "самопала", "самопалов"]))
                                break
                            case 'chestKey':
                                arr.push(reward.value + ' ' + strEnds(reward.value, ["перстень", "перстня", "перстней"]))
                                break
                            case 'guildTravianPlayerPoints':
                                arr.push(reward.value + ' ' + strEnds(reward.value, ["чемодан", "чемодана", "чемоданов"]))
                                break
                            case 'milk':
                                arr.push(reward.value + ' сгущенки')
                                break
                        }
                    }
                    return arr.join(', ')
                },
                log = (msg, type) => {
                    if (currUser > 0) {
                        msg = 'id' + currUser + ': ' + msg
                    }
                    if (typeof type === 'undefined') {
                        type = 'log'
                    } else {
                        type = 'error'
                    }
                    console[type](msg)
                },
                getPage = params => {
                    return new Promise(resolve => {
                        setTimeout(async () => {
                            const r = await fetch('http://' + document.domain + '/prison/universal.php', {
                                method: 'POST',
                                body: params,
                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                            })
                            const resp = await r.text()
                            if (!r.ok || resp === '<result>0</result>') {
                                log('failed request ' + params, true)
                                return resolve('')
                            }
                            resolve(resp)
                        }, timeout)
                    })
                }

            let offers = {}, offer = {}, fakes = '', currUser = 0
            for (let i = 0; !fakes || fakes.length < 32; ++i) {
                fakes = addFakes()
                if (i > 4) {
                    return
                }
            }
            let rows = addRows().split(',', 5), data = '', launchID = 0

            for (f of fakes.split("\n")) {
                const u = f.trim().split(':', 2)
                if (u.length !== 2 || parseInt(u[0]) < 1000 || isNaN(parseInt(u[0])) || u[1].match(/^[a-f0-9]{32}$/) === null) {
                    continue
                }
                currUser = u[0]
                let params = `user=${currUser}&key=${u[1]}`

                if (!data) {
                    log('Получаем данные игры')
                    const tmp = await getPage(params + '&method=getData')
                    if (tmp) {
                        data = JSON.parse(tmp)
                        offers = data.specialLimitedOffers.offers
                        for (let i = offers.length; i > 0; --i) {
                            if (offers[i - 1].id !== offerId) {
                                continue
                            }
                            offer = offers[i - 1]
                            break
                        }
                    }
                    if (!data) {
                        log('пропускаем, не получили данные игры (' + params + ')', true)
                        continue
                    }
                }

                log('Получаем данные')
                let getInfo = await getPage(params + '&method=getInfo')
                if (!getInfo) {
                    log('пропускаем, неверный ид:auth? (' + params + ')', true)
                    continue
                }

                getInfo = xml.parseFromString(getInfo, "application/xml")
                if (!launchID) {
                    const launches = getInfo.querySelector('playerSpecialLimitedOffers').querySelector('launches').querySelectorAll('launch')
                    for (let i = launches.length; i > 0; --i) {
                        if (launches[i - 1].querySelector('offerId').textContent === "25") {
                            launchID = parseInt(launches[i - 1].querySelector('launchId').textContent)
                            break
                        }
                    }
                }

                if (launchID > 0 && rows[0].length > 0) {
                    log('Начинаем покупать акции барыги')
                    for (let row of rows) {
                        row = parseInt(row)
                        if (row < 0 || row > 5 || !existRows[row - 1]) {
                            continue
                        }
                        for (const opt of offer.options) {
                            if (opt.tab !== existRows[row - 1]) {
                                continue
                            }
                            let resp = await getPage(params + `&method=specialLimitedOffers.buyOffer&optionId=${opt.id}&launchId=${launchID}`)
                            if (resp) {
                                resp = JSON.parse(resp)
                                if (resp.code === 0 && resp.result && resp.result.rewards) {
                                    log('награда с ' + [existRows[row - 1], '#', opt.id, logRewards(resp.result.rewards)].join(' '))
                                }
                            }
                        }
                    }
                }

                const birthday = getInfo.querySelector('birthdayPresents') ? getInfo.querySelector('birthdayPresents').querySelector('unit') : null
                if (birthday) {
                    const id = parseInt(birthday.querySelector('id').textContent),
                        cap = parseInt(birthday.querySelector('cap').textContent),
                        status = parseInt(birthday.querySelector('status').textContent)

                    if (id > 0 && cap > status) {
                        for (let i = status; i < cap; ++i) {
                            let resp = await getPage(params + '&method=birthdayPresent.claim&unit=' + id)
                            if (resp) {
                                resp = JSON.parse(resp)
                            }
                            if (!resp || resp.code > 0 || !resp.rewards) {
                                log('ошибка сбора с Люси #' + i + ' ', true)
                                break
                            }
                            log('собрали с Люси #' + i + ' ' + logRewards(resp.rewards))
                        }
                    }
                }
            }
            currUser = 0
            log('Работа завершена')
        } catch (e) {
            console.error(e)
        }
    }
)()
