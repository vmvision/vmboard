'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function AccountForm({
  user,
}: {
  user: {
    id: string
    name: string
    username?: string | null
  }
}) {
  const t = useTranslations('account')
  const [name, setName] = useState(user.name)
  const [username, setUsername] = useState(user.username || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 前端校验
    if (!name.trim()) {
      setError("昵称不能为空")
      return
    }

    const usernamePattern = /^[a-zA-Z0-9_]+$/
    if (username && !usernamePattern.test(username)) {
      setError("用户名只能包含字母、数字和下划线")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('userId', user.id)
      formData.append('name', name)
      formData.append('username', username)

      const response = await fetch('/api/update-user', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json() as { error: string }

      if (!response.ok) {
        throw new Error(result.error || '更新失败')
      }

      alert(t('update_success'))
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          {t('name')}
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="username" className="block text-sm font-medium">
          {t('username')}
        </label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t('optional', { default: '可选' })}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t('saving') : t('save')}
      </Button>
    </form>
  )
}