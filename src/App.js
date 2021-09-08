import React from 'react'
import { useEffect, useState } from 'react'
import { interval, Subject, fromEvent } from 'rxjs'
import { takeUntil, map, buffer, debounceTime, filter } from 'rxjs/operators'

import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'

import './App.css'

function App() {
  const [timer, setTimer] = useState(0)
  const [isActive, setIsActive] = useState(false)

  const onWait = React.useCallback(() => {
    setIsActive(false)
  }, [])

  useEffect(() => {
    const unsubscribe$ = new Subject()
    const source = interval(1000)

    source.pipe(takeUntil(unsubscribe$)).subscribe(() => {
      if (isActive === true) {
        setTimer((value) => value + 1000)
      }
    })

    const clicks$ = fromEvent(document.querySelector('.wait-button'), 'click')
    const debounce$ = clicks$.pipe(debounceTime(300))

    const doubleClick$ = clicks$.pipe(
      buffer(debounce$),
      map((item) => item.length),
      filter((x) => x === 2)
    )

    doubleClick$.subscribe(() => onWait())

    return () => {
      unsubscribe$.next()
      unsubscribe$.complete()
    }
  }, [isActive, onWait])

  const onStart = React.useCallback(() => {
    setIsActive(true)
  }, [])
  const onStop = React.useCallback(() => {
    setIsActive(false)
    setTimer(0)
  }, [])

  const onReset = React.useCallback(() => {
    setTimer(0)
  }, [])

  return (
    <div className="timer-container">
      <span className="timer-text">
        {new Date(timer).toISOString().slice(11, 19)}
      </span>
      <ButtonGroup
        variant="contained"
        size="large"
        color="primary"
        aria-label="contained primary button group"
      >
        <Button
          onClick={isActive ? onStop : onStart}
          color={isActive ? 'secondary' : 'primary'}
        >
          {isActive ? 'Stop' : 'Start'}
        </Button>
        <Button onClick={onReset} disabled={isActive ? false : true}>
          Reset
        </Button>
        <Button className="wait-button" disabled={isActive ? false : true}>
          Wait
        </Button>
      </ButtonGroup>
    </div>
  )
}

export default App
