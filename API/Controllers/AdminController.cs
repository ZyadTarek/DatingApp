using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AdminController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUnitOfWork _unitOfWork;

        public AdminController(UserManager<AppUser> userManager, IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpGet("users-with-roles")]
        public async Task<ActionResult> GetUsersWithRoles()
        {
            var users = await _userManager.Users
                .Include(r => r.UserRoles)
                .ThenInclude(r => r.Role)
                .OrderBy(u => u.UserName)
                .Select(u => new 
                {
                    u.Id,
                    Username = u.UserName,
                    Roles = u.UserRoles.Select(r => r.Role.Name).ToList()
                })
                .ToListAsync();

            return Ok(users);    

        }

        [HttpPost("edit-roles/{username}")]
        public async Task<ActionResult> EditRoles(string username, [FromQuery] string roles)
        {
            var selectedRoles = roles.Split(",").ToArray();
            
            var user = await _userManager.FindByNameAsync(username);

            if(user == null) return NotFound("Could not find user");
            
            var userRoles = await _userManager.GetRolesAsync(user);

            var result = await _userManager.AddToRolesAsync(user, selectedRoles.Except(userRoles));

            if(!result.Succeeded) return BadRequest("Failed to add to roles");

            result = await _userManager.RemoveFromRolesAsync(user, userRoles.Except(selectedRoles));

            if(!result.Succeeded) return BadRequest("Failed to remove from roles");

            return Ok(await _userManager.GetRolesAsync(user)); 
        }


        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpGet("photos-to-moderate")]
        public async Task<ActionResult<IEnumerable<PhotoForApprovalDto>>> GetPhotosForModeration()
        {
            return Ok(await _unitOfWork.PhotosRepository.GetUnapprovedPhotos());
        }

        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpPost("approve-photo/{id}")]
        public async Task<ActionResult> ApprovePhoto(int id)
        {
            var photo = await _unitOfWork.PhotosRepository.GetPhotoById(id);

            var user = await _unitOfWork.UserRepository.GetMemberByPhotoIdAsync(id);

            if(photo == null) return NotFound("Photo is not found");
            
            if(user == null) return NotFound("User is not found");
            
            if(!user.Photos.Any(p => p.IsMain))
            {
                photo.IsMain = true;
            }
            
            
            photo.IsApproved = true;
            
            if(!await _unitOfWork.Complete()) BadRequest("Cannot approve photo");
            
            return Ok();
        }

        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpPost("reject-photo/{id}")]
        public async Task<ActionResult> RejectPhoto(int id)
        {
            var photo = await _unitOfWork.PhotosRepository.GetPhotoById(id);
            
            if(photo == null) return NotFound("Photo is not found");
            
            photo.IsApproved = false;
            
            if(!await _unitOfWork.Complete()) BadRequest("Cannot reject photo");

            return Ok();
        }
    }
}