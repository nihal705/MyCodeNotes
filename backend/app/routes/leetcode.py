from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter(prefix="/api/leetcode", tags=["leetcode"])

@router.get("/stats/{username}")
async def get_leetcode_stats(username: str):
    """Fetch LeetCode stats for a given username"""
    url = "https://leetcode.com/graphql/"
    
    query = """
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
        profile {
          realName
          aboutMe
          countryName
          reputation
          ranking
        }
        contributions {
          points
        }
      }
      userContestRanking(username: $username) {
        rating
        ranking
        totalParticipants
      }
    }
    """
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            json={"query": query, "variables": {"username": username}}
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="Failed to fetch LeetCode stats"
            )
        
        data = response.json()
        
        if "errors" in data:
            raise HTTPException(
                status_code=400,
                detail=data["errors"][0]["message"]
            )
        
        if not data.get("data", {}).get("matchedUser"):
            raise HTTPException(
                status_code=404,
                detail="User not found on LeetCode"
            )
        
        return data["data"]