import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'movie'; // movie, tv, anime, variety

    try {
        // Intercept anime and variety since Douban only supports movie/tv
        if (type === 'anime') {
            return NextResponse.json({
                tags: ['近期热门', '日本动画', '国产动画', '欧美动画']
            });
        }
        
        if (type === 'variety') {
            return NextResponse.json({
                tags: ['近期热门', '大陆综艺', '港台综艺', '日韩综艺', '欧美综艺']
            });
        }

        const url = `https://movie.douban.com/j/search_tags?type=${type}&source=index`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Referer': 'https://movie.douban.com/',
            },
            next: { revalidate: 86400 }, // Cache tags for 24 hours
        });

        if (!response.ok) {
            throw new Error(`Douban API returned ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Douban Tags API error:', error);
        return NextResponse.json(
            { tags: [], error: 'Failed to fetch tags' },
            { status: 500 }
        );
    }
}
