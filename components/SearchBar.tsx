"use client"

import { scrapeAndStoreProduct } from '@/lib/actions';
import { FormEvent, useState } from 'react'

const isValidProductURL = (url: string) => {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;

    if(
      hostname.includes('wildberries.ru') || 
      hostname.includes ('wildberries.') || 
      hostname.endsWith('wildberries') ||
      hostname.includes('kazanexpress.ru') || 
      hostname.includes ('kazanexpress.') || 
      hostname.endsWith('kazanexpress')
    ) {
      return true;
    }
  } catch (error) {
    return false;
  }
}

const Searchbar = () => {
  const [searchPrompt, setSearchPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValidLink = isValidProductURL(searchPrompt);

    if(!isValidLink) return alert('Предоставьте корректную ссылку на маркетплейс')

    try {
      setIsLoading(true);

      // Парсим товар
      const product = await scrapeAndStoreProduct(searchPrompt);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form 
      className="flex flex-wrap gap-4 mt-12" 
      onSubmit={handleSubmit}
    >
      <input 
        type="text"
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder="Введите ссылку на товар"
        className="searchbar-inputfield"
      />

      <button 
        type="submit" 
        className="searchbar-button"
        disabled={searchPrompt === ''}
      >
        {isLoading ? 'Ищем...' : 'Поиск'}
      </button>
    </form>
  )
}

export default Searchbar