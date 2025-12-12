'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { ActiveTimer, RateType, TimeEntryFormData } from '@/lib/types'
import { secondsToHours } from '@/lib/constants'

const TIMER_STORAGE_KEY = 'active-timer'

interface UseTimerReturn {
  activeTimer: ActiveTimer | null
  elapsedSeconds: number
  formattedTime: string
  isRunning: boolean
  startTimer: (config: {
    taskId: string
    employeeId: string
    rateType: RateType
    billable: boolean
    notes?: string
  }) => void
  stopTimer: () => TimeEntryFormData | null
  cancelTimer: () => void
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function generateTimerId(): string {
  return `timer-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function useTimer(): UseTimerReturn {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load timer from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const saved = localStorage.getItem(TIMER_STORAGE_KEY)
    if (saved) {
      try {
        const timer = JSON.parse(saved) as ActiveTimer
        setActiveTimer(timer)
      } catch {
        localStorage.removeItem(TIMER_STORAGE_KEY)
      }
    }
  }, [])

  // Calculate elapsed seconds when timer is active
  useEffect(() => {
    if (!activeTimer) {
      setElapsedSeconds(0)
      return
    }

    const calculateElapsed = () => {
      const startTime = new Date(activeTimer.startedAt).getTime()
      const now = Date.now()
      return Math.floor((now - startTime) / 1000)
    }

    // Set initial value
    setElapsedSeconds(calculateElapsed())

    // Update every second
    intervalRef.current = setInterval(() => {
      setElapsedSeconds(calculateElapsed())
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [activeTimer])

  const startTimer = useCallback((config: {
    taskId: string
    employeeId: string
    rateType: RateType
    billable: boolean
    notes?: string
  }) => {
    const timer: ActiveTimer = {
      id: generateTimerId(),
      taskId: config.taskId,
      employeeId: config.employeeId,
      startedAt: new Date().toISOString(),
      rateType: config.rateType,
      billable: config.billable,
      notes: config.notes,
    }

    setActiveTimer(timer)
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timer))
  }, [])

  const stopTimer = useCallback((): TimeEntryFormData | null => {
    if (!activeTimer) return null

    const hours = secondsToHours(elapsedSeconds)

    // Create time entry data
    const entryData: TimeEntryFormData = {
      date: new Date().toISOString().split('T')[0],
      hours: hours > 0 ? hours : 0.25, // Minimum 15 minutes
      rateType: activeTimer.rateType,
      notes: activeTimer.notes,
      billable: activeTimer.billable,
      employeeId: activeTimer.employeeId,
      entryMode: 'timer',
    }

    // Clear timer
    setActiveTimer(null)
    setElapsedSeconds(0)
    localStorage.removeItem(TIMER_STORAGE_KEY)

    return entryData
  }, [activeTimer, elapsedSeconds])

  const cancelTimer = useCallback(() => {
    setActiveTimer(null)
    setElapsedSeconds(0)
    localStorage.removeItem(TIMER_STORAGE_KEY)
  }, [])

  return {
    activeTimer,
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
    isRunning: !!activeTimer,
    startTimer,
    stopTimer,
    cancelTimer,
  }
}
