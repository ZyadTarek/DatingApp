using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class PhotoRepository : IPhotoRepository
    {
        private readonly IMapper _mapper;
        private readonly DataContext _context;
        public PhotoRepository(DataContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Photo> GetPhotoById(int id)
        {
            var query = _context.Photos
                    .Where(p => p.Id == id)
                    .IgnoreQueryFilters()
                    .AsQueryable();
                 
            return await query.SingleOrDefaultAsync();   
        }

        public async Task<IEnumerable<PhotoForApprovalDto>> GetUnapprovedPhotos()
        {
            var query = _context.Photos
                .Where(p => p.IsApproved == false)
                .ProjectTo<PhotoForApprovalDto>(_mapper.ConfigurationProvider)
                .AsQueryable();
            
            return await query.IgnoreQueryFilters().ToListAsync();    
        }

        public async void RemovePhoto(int id)
        {
            var photo = await _context.Photos.FindAsync(id);

            if(photo != null) 
            {
                _context.Photos.Remove(photo);
            }
               
        }
    }
}