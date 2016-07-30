export default {
    types: [
        {
            name: "Test",
            fileName: "points.ply",
        },
                {
            name: "ThreeTrees",
            fileName: "3tress_2.ply"
        },
         {
            name: "palm",
            fileName: "palm.ply"
        },
         {
            name: "single",
            fileName: "singleTree.ply"
        }
    ],
    instances: [
    
         {
            type: "ThreeTrees",
            position: [6,26,16],
            rotateX: -10,
            scale: 4.3
        },
         {
            type: "ThreeTrees",
            position: [0,22,19],
            rotateX: -14,
            scale: 4.2
        },
         {
            type: "ThreeTrees",
            position: [45,24,2],
            rotateX: 0,
            scale: 4.4
        }, 
        {
            type: "ThreeTrees",
            position: [43,24,3],
            rotateX: 0,
            scale: 4.4
        },
        {
            type: "palm",
            position: [-18,16,10],
            rotateX: -100,
            scale: 3
        },

        {
            type: "palm",
            position: [8,22,6],
            rotateX: 60,
            scale: 3
        },
        {
            type: "single",
            position: [-50,18,3],
            rotateX: 60,
            scale: 3
        }
   
    ]
}



