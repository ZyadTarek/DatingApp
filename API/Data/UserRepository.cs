using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace API.Data
{
    public class UserRepository : IUserRepository
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        public UserRepository(DataContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }

        public async Task<MemberDto> GetMemberAsync(string username, bool IsCurrentUser)
        {
            var query = _context.Users
            .Where(user => user.UserName == username)
            .ProjectTo<MemberDto>(_mapper.ConfigurationProvider)
            .AsQueryable();
            
            if(IsCurrentUser) query = query.IgnoreQueryFilters();

            return await query.SingleOrDefaultAsync();
        }

        public async Task<MemberDto> GetMemberByPhotoIdAsync(int id)
        {
            var photo = await _context.Photos
                .IgnoreQueryFilters()
                .ProjectTo<PhotoForApprovalDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(p => p.Id == id);
            
            return await GetMemberAsync(photo.Username, false);
        }

        public async Task<PagedList<MemberDto>> GetMembersAsync(UserParams userParams)
        {
            try
            {
            
            var query = _context.Users.AsQueryable();


            query = query.Where(u => u.UserName != userParams.CurrentUsername);
            query = query.Where(u => u.Gender == userParams.Gender);

            var minDob = DateTime.Today.AddYears(-userParams.MaxAge - 1);
            var maxDob = DateTime.Today.AddYears(-userParams.MinAge);

            query = query.Where(u => u.DateOfBirth >= minDob && u.DateOfBirth <= maxDob);

            query = userParams.OrderBy switch 
            { 
               "created" => query.OrderByDescending(u => u.Created),
               _=> query.OrderByDescending(u => u.LastActive)
            };

            return await PagedList<MemberDto>.CreateAsync(query.ProjectTo<MemberDto>(_mapper
                .ConfigurationProvider).AsNoTracking(),
             userParams.PageNumber, userParams.PageSize);
            }
            catch(Exception e)
            {
                throw e;
            }
        }

        public async Task<AppUser> GetUserByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<AppUser> GetUserByUsernameAsync(string username, bool allowAllPhotos )
        {
            var query = _context.Users.Include(x => x.Photos).AsQueryable();
            
            if(allowAllPhotos) query = query.IgnoreQueryFilters();
            
            return await query.SingleOrDefaultAsync(user => user.UserName == username);
        }

        public async Task<string> GetUserGender(string username)
        {
           return await _context.Users
                .Where(x => x.UserName == username)
                .Select(x => x.Gender)
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<AppUser>> GetUsersAsync()
        {
            return await _context.Users.Include(x => x.Photos).ToListAsync<AppUser>();
        }

        public void Update(AppUser user)
        {
            _context.Entry<AppUser>(user).State = EntityState.Modified;
        }
    }
}