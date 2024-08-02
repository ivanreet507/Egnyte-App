using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PathLengthChecker
{
    class Program
    {
        static void Main(string[] args)
        {
            var options = new PathLengthSearchOptions
            {
                RootPath = args[0],
                MinPathLength = 0,
                MaxPathLength = int.MaxValue,
                OutputType = OutputTypes.Console
            };

            var retriever = new PathRetriever(options);
            var pathInfos = retriever.GetPaths();

            foreach (var pathInfo in pathInfos)
            {
                Console.WriteLine($"{pathInfo.Path} - {pathInfo.Length}");
            }
        }
    }
}
