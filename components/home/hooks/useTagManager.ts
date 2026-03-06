import { useState, useEffect } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useTagsStore, DEFAULT_TAG, ContentType } from '@/lib/store/tags-store';

export function useTagManager() {
    const { 
        contentType, 
        setContentType, 
        tagsByContentType, 
        setTags: setStoreTags 
    } = useTagsStore();
    
    // Derived tags for the current content type
    const storeTags = tagsByContentType[contentType] || [];
    
    const [selectedTag, setSelectedTag] = useState(DEFAULT_TAG.value);
    
    // We keep a local state for rendering that syncs with the store
    // This makes DnD and API fetching smoother
    const [tags, setTags] = useState<any[]>(storeTags);
    const [isLoadingTags, setIsLoadingTags] = useState(false);
    const [newTagInput, setNewTagInput] = useState('');
    const [showTagManager, setShowTagManager] = useState(false);
    const [justAddedTag, setJustAddedTag] = useState(false);

    // Sync local tags when content type or store tags change (e.g. from Cloud sync)
    useEffect(() => {
        if (storeTags.length > 0) {
            setTags(storeTags);
        }
    }, [storeTags, contentType]);

    // Load custom tags or fetch from Douban
    useEffect(() => {
        const loadTags = async () => {
            // If the store already has tags for this type, don't fetch from Douban
            if (storeTags.length > 0) {
                setTags(storeTags);
                return;
            }

            // If no saved tags in store, fetch from Douban
            setIsLoadingTags(true);
            try {
                const response = await fetch(`/api/douban/tags?type=${contentType}`);
                const data = await response.json();
                if (data.tags && Array.isArray(data.tags)) {
                    const mappedTags = data.tags.map((label: string) => ({
                        id: label === '热门' ? 'popular' : `tag_${label}`,
                        label,
                        value: label,
                    }));

                    // If "热门" isn't in the list, add it to the front
                    if (!mappedTags.some((t: any) => t.value === '热门')) {
                        mappedTags.unshift(DEFAULT_TAG);
                    }

                    // Save the fetched tags into the Zustand store
                    setStoreTags(contentType, mappedTags);
                } else {
                    setStoreTags(contentType, [DEFAULT_TAG]);
                }
            } catch (error) {
                console.error('Fetch tags error:', error);
                setStoreTags(contentType, [DEFAULT_TAG]);
            } finally {
                setIsLoadingTags(false);
            }
        };

        loadTags();
        setSelectedTag(DEFAULT_TAG.value);
    }, [contentType, storeTags.length, setStoreTags]);

    const saveTags = (newTags: any[]) => {
        setTags(newTags); // update local UI quickly
        setStoreTags(contentType, newTags); // persist to store
    };

    const handleAddTag = () => {
        if (!newTagInput.trim()) return;
        const newTag = {
            id: `custom_${Date.now()}`,
            label: newTagInput.trim(),
            value: newTagInput.trim(),
        };
        saveTags([...tags, newTag]);
        setNewTagInput('');
        setJustAddedTag(true);
    };

    const handleDeleteTag = (tagId: string) => {
        saveTags(tags.filter(t => t.id !== tagId));
        if (selectedTag === tagId) {
            setSelectedTag('popular');
        }
    };

    const handleRestoreDefaults = async () => {
        // Clear from Zustand store
        setStoreTags(contentType, []);
        // Refresh by re-fetching
        setIsLoadingTags(true);
        try {
            const response = await fetch(`/api/douban/tags?type=${contentType}`);
            const data = await response.json();
            if (data.tags && Array.isArray(data.tags)) {
                const mappedTags = data.tags.map((label: string) => ({
                    id: label === '热门' ? 'popular' : `tag_${label}`,
                    label,
                    value: label,
                }));
                if (!mappedTags.some((t: any) => t.value === '热门')) {
                    mappedTags.unshift(DEFAULT_TAG);
                }
                setTags(mappedTags);
            } else {
                setTags([DEFAULT_TAG]);
            }
        } catch (error) {
            setTags([DEFAULT_TAG]);
        } finally {
            setIsLoadingTags(false);
        }
        setSelectedTag(DEFAULT_TAG.value);
        setShowTagManager(false);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = tags.findIndex((tag) => tag.id === active.id);
            const newIndex = tags.findIndex((tag) => tag.id === over.id);
            saveTags(arrayMove(tags, oldIndex, newIndex));
        }
    };

    return {
        tags,
        selectedTag,
        contentType,
        newTagInput,
        showTagManager,
        justAddedTag,
        isLoadingTags,
        setContentType,
        setSelectedTag,
        setNewTagInput,
        setShowTagManager,
        setJustAddedTag,
        handleAddTag,
        handleDeleteTag,
        handleRestoreDefaults,
        handleDragEnd,
    };
}
