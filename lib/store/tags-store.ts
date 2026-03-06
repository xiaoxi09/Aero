/**
 * Tags Store - Manages custom user tags and content type preference
 * Uses Zustand with localStorage persistence and Upstash Cloud Sync support
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { profiledKey } from '@/lib/utils/profile-storage';

export type ContentType = 'movie' | 'tv' | 'anime' | 'variety';

export interface TagItem {
    id: string;
    label: string;
    value: string;
}

export const DEFAULT_TAG: TagItem = { id: 'popular', label: '热门', value: '热门' };

interface TagsState {
    contentType: ContentType;
    tagsByContentType: Record<ContentType, TagItem[]>;
}

interface TagsActions {
    setContentType: (type: ContentType) => void;
    setTags: (type: ContentType, tags: TagItem[]) => void;
    addTag: (type: ContentType, tag: TagItem) => void;
    removeTag: (type: ContentType, tagId: string) => void;
    getTagsForType: (type: ContentType) => TagItem[];
}

export const useTagsStore = create<TagsState & TagsActions>()(
    persist(
        (set, get) => ({
            contentType: 'movie',
            tagsByContentType: {
                movie: [],
                tv: [],
                anime: [],
                variety: []
            },

            setContentType: (type) => set({ contentType: type }),
            
            setTags: (type, tags) => set((state) => ({
                tagsByContentType: {
                    ...state.tagsByContentType,
                    [type]: tags
                }
            })),

            addTag: (type, tag) => set((state) => {
                const currentTags = state.tagsByContentType[type] || [];
                // Check if already exists to prevent duplicates
                if (currentTags.find(t => t.id === tag.id || t.value === tag.value)) {
                    return state;
                }
                return {
                    tagsByContentType: {
                        ...state.tagsByContentType,
                        [type]: [...currentTags, tag]
                    }
                };
            }),

            removeTag: (type, tagId) => set((state) => {
                const currentTags = state.tagsByContentType[type] || [];
                return {
                    tagsByContentType: {
                        ...state.tagsByContentType,
                        [type]: currentTags.filter(t => t.id !== tagId)
                    }
                };
            }),

            getTagsForType: (type) => {
                const state = get();
                const tagsForType = state.tagsByContentType[type];
                
                // Return an empty array if not initialized or loaded yet, 
                // useTagManager will handle the Douban API fetch fallback
                if (!tagsForType || tagsForType.length === 0) {
                    return [];
                }
                return tagsForType;
            }
        }),
        {
            name: profiledKey('kvideo-tags-store'),
            // Optionally merge function could be provided if we needed complex migrations
        }
    )
);
