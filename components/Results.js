import React from 'react'
import Thumbnail from './Thumbnail'
import FlipMove from 'react-flip-move';
function Results({ results }) { // Sửa 'requets' thành 'results'
  return (
    <FlipMove className='px-5 my-10 sm:grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5'>
      {results.map((result) => ( // Sử dụng 'results' thay vì 'requets'
        <Thumbnail key={result.id} result={result} />
      ))}
    </FlipMove>
  )
}

export default Results
