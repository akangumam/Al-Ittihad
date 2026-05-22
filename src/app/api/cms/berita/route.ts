import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import prisma from '@/lib/prisma'
import { authOptions } from '@/libs/auth'

export async function GET() {
  try {
    const articles = await prisma.newsArticle.findMany({
      orderBy: { createdAt: 'desc' }
    })

    const news = articles.map(a => ({
      id: a.id,
      judul: a.title,
      slug: a.slug,
      konten: a.content,
      excerpt: a.excerpt,
      foto: a.coverImage,
      kategori: a.category,
      status: a.isPublished ? 'published' : 'draft',
      publishedAt: a.publishedAt?.toISOString() ?? null,
      penulis: a.author,
      views: a.viewCount,
      createdAt: a.createdAt.toISOString()
    }))

    return NextResponse.json(news)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const slug = (body.judul as string)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    const isPublished = body.status === 'published'

    const article = await prisma.newsArticle.create({
      data: {
        title: body.judul,
        slug,
        content: body.konten,
        excerpt: body.excerpt ?? null,
        coverImage: body.foto ?? null,
        category: body.kategori ?? 'Umum',
        author: body.penulis ?? session.user.name ?? 'Admin',
        isPublished,
        publishedAt: isPublished ? new Date() : null
      }
    })

    return NextResponse.json(
      {
        id: article.id,
        judul: article.title,
        slug: article.slug,
        status: article.isPublished ? 'published' : 'draft',
        createdAt: article.createdAt.toISOString()
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save news article' }, { status: 500 })
  }
}
