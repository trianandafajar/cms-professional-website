// src/collections/Categories.ts
import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    group: 'Master Data',
  },
  custom: {
    nav: {
      groupLabel: 'Master Data',
      groupOrder: 20,
      label: 'Categories',
      icon: 'FolderKanban',
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'Nama icon (misal: Music, Coffee, etc.)',
      },
    },
    {
      name: 'group',
      type: 'select',
      options: [
        { label: 'School Activities', value: 'school-activities' },
        { label: 'Hobbies', value: 'hobbies' },
        { label: 'Home & Lifestyle', value: 'home-lifestyle' },
        { label: 'Fashion', value: 'fashion' },
        { label: 'Government', value: 'government' },
        { label: 'Family & Education', value: 'family-education' },
        { label: 'Spirituality', value: 'spirituality' },
        { label: 'Charity & Causes', value: 'charity-causes' },
        { label: 'Travel & Outdoor', value: 'travel-outdoor' },
        { label: 'Science & Tech', value: 'science-tech' },
        { label: 'Health', value: 'health' },
        { label: 'Sports & Fitness', value: 'sports-fitness' },
        { label: 'Film & Media', value: 'film-media' },
        { label: 'Arts', value: 'arts' },
        { label: 'Community', value: 'community' },
        { label: 'Food & Drink', value: 'food-drink' },
        { label: 'Business', value: 'business' },
        { label: 'Music', value: 'music' },
      ],
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      defaultValue: 'active',
    },
  ],
}
